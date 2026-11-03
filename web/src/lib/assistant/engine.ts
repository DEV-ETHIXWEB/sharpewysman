/**
 * Sharpe Assistant: a deterministic, knowledge-grounded conversational engine.
 * No language model is involved. Answers come only from the site's own content,
 * so the assistant cannot invent facts.
 *
 * Pipeline per message:
 *   1. normalise + typo-correct against the knowledge vocabulary
 *   2. extract entities (name, job references, industry, location, salary floor, audience)
 *   3. resolve conversational references ("the second one", "tell me more", "salary?")
 *   4. classify intent with weighted patterns
 *   5. compose a reply from templates + live knowledge, with varied phrasing
 *   6. fall back to BM25 retrieval over all content; then an honest "not sure" + human handoff
 */
import type { AssistantKB, Block, Ctx, KBJob, Reply } from "./types";

/* ---------------------------------------------------------------- text */

const STOP = new Set(
  "a an the and or but if of to in on at for with by from as is are was were be been am do does did i me my we our you your it its this that these those there here what which who whom how when where why can could would should will shall may might must have has had any some about into than then so too very just please hi hey hello tell show give get want need know like".split(
    " ",
  ),
);

/** Canonical forms so different words for the same idea match. */
const CANON: Record<string, string> = {
  cv: "resume", résumé: "resume", resumes: "resume", curriculum: "resume",
  pay: "salary", paid: "salary", wage: "salary", wages: "salary", compensation: "salary", remuneration: "salary", money: "salary", earn: "salary", package: "salary",
  fees: "fee", cost: "fee", costs: "fee", charge: "fee", charges: "fee", price: "fee", pricing: "fee", rate: "fee", rates: "fee",
  jobs: "job", role: "job", roles: "job", position: "job", positions: "job", opening: "job", openings: "job", vacancy: "job", vacancies: "job", opportunity: "job", opportunities: "job",
  hiring: "hire", hired: "hire", recruit: "hire", recruiting: "hire", recruitment: "hire", staffing: "hire",
  accountant: "accounting", accountants: "accounting", cpa: "accounting", cpas: "accounting", bookkeeping: "accounting", finance: "accounting", financial: "accounting",
  assurance: "audit", auditor: "audit", auditing: "audit",
  lawyer: "legal", lawyers: "legal", law: "legal", paralegal: "legal", counsel: "legal",
  tech: "it", technology: "it", software: "it", developer: "it", developers: "it", programmer: "it", data: "it", cyber: "it",
  hr: "humanresources", people: "humanresources", payroll: "humanresources",
  engineer: "engineering", engineers: "engineering",
  confidentiality: "confidential", private: "confidential", privacy: "confidential", discreet: "confidential", secret: "confidential",
  firm: "employer", company: "employer", companies: "employer", business: "employer", employers: "employer",
  candidates: "candidate", jobseeker: "candidate", applicant: "candidate",
  downtown: "vancouver", yvr: "vancouver",
};

function stem(w: string) {
  if (w.length <= 4) return w;
  return w.replace(/(ies)$/, "y").replace(/(ing|ers|er|ed|es|s)$/, "");
}

export function normalise(s: string) {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9$'\s.,%-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(s: string): string[] {
  return normalise(s)
    .replace(/[.,%'-]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => CANON[w] ?? w)
    .filter((w) => !STOP.has(w))
    .map(stem);
}

function lev(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

/* -------------------------------------------------------------- engine */

interface Doc {
  id: string;
  tokens: string[];
  answer: Block[];
  chips?: string[];
}

const pick = <T,>(arr: T[], seed: number) => arr[Math.abs(seed) % arr.length];
const salaryText = (j: KBJob) =>
  j.salaryMin ? `$${Math.round(j.salaryMin / 1000)}k${j.salaryMax && j.salaryMax !== j.salaryMin ? ` to $${Math.round(j.salaryMax / 1000)}k` : ""}${j.salaryNote ? ` ${j.salaryNote}` : ""}` : null;

const COMMON_WORDS =
  "about after again apply around because before being between could different does doing during either every first found from have having interested looking maybe might other people please question right roles similar should something still their there these thing think those through today under until weather where which while would years yourself hiring candidates employers salary salaries positions openings";

const INTENT_WORDS =
  "hello thanks bye apply register resume fee confidential process steps service retained contingency consulting industry industries founder team office located salary job hire candidate employer timeline quickly testimonial review article advice human person call phone email contact surrey burnaby richmond vancouver tax audit controller director partner manager compilations senior";

export class AssistantEngine {
  private kb: AssistantKB;
  private docs: Doc[] = [];
  private df = new Map<string, number>();
  private avgLen = 1;
  private vocab = new Set<string>();

  constructor(kb: AssistantKB) {
    this.kb = kb;
    this.buildIndex();
  }

  /* ---------------------------------------------------------- index */

  private buildIndex() {
    const { kb } = this;
    const add = (id: string, text: string, answer: Block[], chips?: string[]) => this.docs.push({ id, tokens: tokens(text), answer, chips });

    kb.faqs.forEach((f) => add(`faq:${f.id}`, `${f.question} ${f.question} ${f.answer}`, [{ kind: "text", text: f.answer }]));
    kb.services.forEach((s) =>
      add(`service:${s.slug}`, `${s.title} ${s.title} ${s.lede} ${s.body} ${s.bestFor}`, [
        { kind: "text", text: `**${s.title}.** ${s.lede} ${s.body}` },
        { kind: "actions", actions: [{ label: "Compare our services", href: `/employers#${s.slug}` }] },
      ]),
    );
    kb.industries.forEach((i) =>
      add(`industry:${i.slug}`, `${i.name} ${i.name} ${i.tagline} ${i.intro} ${i.specialisms.join(" ")} ${i.roles.join(" ")}`, [
        { kind: "text", text: `**${i.name}.** ${i.tagline} We recruit for roles such as ${listText(i.roles)}.` },
        { kind: "actions", actions: [{ label: `Explore ${i.name}`, href: `/industries/${i.slug}` }] },
      ]),
    );
    kb.articles.forEach((a) =>
      add(`article:${a.slug}`, `${a.title} ${a.title} ${a.excerpt}`, [
        { kind: "text", text: `We've written about this: **${a.title}**. ${a.excerpt}` },
        { kind: "actions", actions: [{ label: "Read the article", href: `/insights/${a.slug}` }] },
      ]),
    );
    kb.employerProcess.forEach((s, i) =>
      add(`eproc:${i}`, `employer hire process step ${s.title} ${s.body}`, [{ kind: "text", text: `For employers, step ${i + 1} is **${s.title.toLowerCase()}**: ${s.body}` }]),
    );
    kb.candidateProcess.forEach((s, i) =>
      add(`cproc:${i}`, `candidate process step ${s.title} ${s.body}`, [{ kind: "text", text: `For candidates, step ${i + 1} is **${s.title.toLowerCase()}**: ${s.body}` }]),
    );
    add("founder", `founder history about ${kb.founder.name} ${kb.founder.bio.join(" ")}`, [{ kind: "text", text: kb.founder.bio.join(" ") }]);

    for (const d of this.docs) new Set(d.tokens).forEach((t) => this.df.set(t, (this.df.get(t) ?? 0) + 1));
    this.avgLen = this.docs.reduce((a, d) => a + d.tokens.length, 0) / Math.max(1, this.docs.length);

    const allText = [
      INTENT_WORDS,
      COMMON_WORDS,
      ...kb.faqs.map((f) => `${f.question} ${f.answer}`),
      ...kb.services.map((x) => `${x.title} ${x.lede} ${x.body}`),
      ...kb.articles.map((a) => `${a.title} ${a.excerpt}`),
      ...kb.employerProcess.concat(kb.candidateProcess).map((x) => `${x.title} ${x.body}`),
      ...kb.jobs.map((j) => `${j.title} ${j.location} ${j.summary}`),
      ...kb.industries.map((i) => `${i.name} ${i.roles.join(" ")}`),
      ...kb.team.map((t) => t.name),
    ].join(" ");
    normalise(allText)
      .split(/[\s.,]+/)
      .filter((w) => w.length >= 4)
      .forEach((w) => this.vocab.add(w));
  }

  private bm25(q: string[]) {
    const N = this.docs.length;
    const k1 = 1.4;
    const b = 0.75;
    return this.docs
      .map((d) => {
        let score = 0;
        for (const t of new Set(q)) {
          const f = d.tokens.filter((x) => x === t).length;
          if (!f) continue;
          const n = this.df.get(t) ?? 0;
          const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
          score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.tokens.length) / this.avgLen)));
        }
        return { d, score };
      })
      .sort((a, b2) => b2.score - a.score);
  }

  /** Corrects obvious typos ("acounting", "salery") against the knowledge vocabulary. */
  private correct(text: string) {
    return normalise(text)
      .split(" ")
      .map((w) => {
        if (w.length < 5 || this.vocab.has(w) || /\d/.test(w)) return w;
        if (w.endsWith("s") && this.vocab.has(w.slice(0, -1))) return w;
        let best = w;
        let bestD = w.length >= 8 ? 2 : 1;
        for (const v of this.vocab) {
          const d = lev(w, v);
          if (d <= bestD && d > 0) {
            best = v;
            bestD = d;
            if (d === 1) break;
          }
        }
        return best;
      })
      .join(" ");
  }

  /* --------------------------------------------------------- matching */

  private matchJobs(q: string, raw: string): KBJob[] {
    const qt = new Set(tokens(q));
    const floor = salaryFloor(raw);
    const city = /\bsurrey\b/.test(q) ? "Surrey" : /\b(downtown|vancouver)\b/.test(q) && !/greater/.test(q) ? "Vancouver" : null;
    const scored = this.kb.jobs.map((j) => {
      const title = tokens(j.title);
      const body = tokens(`${j.summary} ${j.highlights.join(" ")} ${j.requirements.join(" ")}`);
      let s = 0;
      title.forEach((t) => qt.has(t) && (s += t === "manag" || t === "senior" ? 1 : 3));
      body.forEach((t) => qt.has(t) && (s += 0.4));
      if (city && j.city === city) s += 2;
      if (city && j.city !== city) s -= 8;
      if (floor && (j.salaryMax ?? j.salaryMin ?? 0) < floor) s -= 10;
      if (floor && (j.salaryMax ?? 0) >= floor) s += 3;
      return { j, s };
    });
    return scored
      .filter((x) => x.s > 0.9)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.j);
  }

  private findJobByName(q: string): KBJob | undefined {
    const qt = new Set(tokens(q));
    let best: { j: KBJob; s: number } | undefined;
    for (const j of this.kb.jobs) {
      const tt = tokens(j.title).filter((t) => !["manag", "senior", "accounting", "job"].includes(t));
      const hit = tt.filter((t) => qt.has(t)).length;
      const s = hit / Math.max(1, tt.length);
      if (hit >= 1 && s >= 0.5 && (!best || s > best.s)) best = { j, s };
    }
    return best?.j;
  }

  private detectIndustry(q: string) {
    const map: [RegExp, string][] = [
      [/\b(legal|law|lawyer|paralegal|counsel|litigation)\b/, "legal"],
      [/\b(it|tech|technology|software|developer|programmer|cyber|data|cloud|erp)\b/, "information-technology"],
      [/\b(hr|human resources|payroll|people and culture|talent acquisition)\b/, "human-resources"],
      [/\b(engineer|engineering|civil|mechanical|electrical)\b/, "engineering"],
      [/\b(accounting|accountant|cpa|finance|financial|tax|audit|assurance|controller|cfo|bookkeep)/, "accounting"],
    ];
    const hit = map.find(([re]) => re.test(q));
    return hit ? this.kb.industries.find((i) => i.slug === hit[1]) : undefined;
  }

  /* ------------------------------------------------------------ reply */

  respond(input: string, ctx: Ctx): { reply: Reply; ctx: Ctx } {
    const raw = input.trim();
    const q = this.correct(raw);
    const c: Ctx = { ...ctx, turn: ctx.turn + 1 };
    const seed = c.turn + raw.length;
    const { kb } = this;
    const hey = c.name ? pick([`${c.name}, `, "", ""], seed) : "";
    const cap = (s: string) => (hey ? s.charAt(0).toLowerCase() + s.slice(1) : s);
    const text = (t: string): Block => ({ kind: "text", text: t });
    const contact: Block = {
      kind: "actions",
      actions: [
        { label: `Call ${kb.settings.phone}`, href: `tel:${kb.settings.phoneHref}`, primary: true },
        { label: "Send a message", href: "/contact" },
      ],
    };
    const done = (reply: Reply, intent: string, patch: Partial<Ctx> = {}) => ({ reply, ctx: { ...c, ...patch, lastIntent: intent } });

    if (!q) return done({ blocks: [text("Ask me anything about our jobs, how we work with employers, or how we help candidates.")] }, "empty");

    // Audience signals
    if (/\b(i'?m|i am|we'?re|we are)\b.*\b(hiring|looking to hire|need to hire|recruiting for)\b|\bour (firm|company|team)\b/.test(q)) c.audience = "employer";
    if (/\b(looking for (a|my next) (job|role|position)|job ?seeker|candidate|my career|i'?m a cpa|my resume)\b/.test(q)) c.audience = "candidate";

    // Name capture: "my name is Priya", "I'm Jordan"
    const nm = raw.match(/\b(?:my name is|i am|i'm|im|this is)\s+([A-Za-z][a-z]{1,20})\b/i);
    const NOT_NAMES = /^(a|an|the|looking|hiring|interested|from|in|at|not|just|new|currently|trying|here|good|fine|ok|okay|cpa|an?|working|employed|unemployed|recruiting|after|seeking)$/i;
    if (nm && !NOT_NAMES.test(nm[1])) {
      c.name = nm[1].charAt(0).toUpperCase() + nm[1].slice(1).toLowerCase();
      if (raw.split(/\s+/).length <= 5) {
        return done(
          {
            blocks: [text(`Nice to meet you, ${c.name}. Are you hiring, or exploring your next role? I can help with either.`)],
            chips: ["I'm hiring", "I'm looking for a role", "Show me current jobs"],
          },
          "name",
        );
      }
    }

    /* ---- small talk */
    if (/^(hi|hello|hey|hiya|howdy|yo|good (morning|afternoon|evening))\b/.test(q) && q.split(" ").length <= 4) {
      return done(
        {
          blocks: [
            text(
              pick(
                [
                  `${c.name ? `Hello again, ${c.name}.` : "Hello."} I'm the Sharpe Wysman assistant. I can walk you through our current roles, how we work with employers, or how we help candidates.`,
                  `Hi${c.name ? ` ${c.name}` : ""}, good to see you. What brings you to Sharpe Wysman today?`,
                ],
                seed,
              ),
            ),
          ],
          chips: ["Show me current jobs", "I'm hiring", "How does it work?", "Is it free for candidates?"],
        },
        "greet",
      );
    }
    if (/\b(thanks|thank you|thx|cheers|appreciate it|much appreciated)\b/.test(q)) {
      return done(
        { blocks: [text(pick(["You're very welcome. Anything else I can help with?", "My pleasure. Is there anything else you'd like to know?", "Glad that helped. I'm here if you have more questions."], seed))], chips: ["Show me current jobs", "Talk to a recruiter"] },
        "thanks",
      );
    }
    if (/\b(bye|goodbye|see you|that'?s all|that is all|no thanks|nothing else)\b/.test(q)) {
      return done({ blocks: [text(`Thanks for stopping by${c.name ? `, ${c.name}` : ""}. If anything comes up, we're a call or a message away.`), contact] }, "bye");
    }
    if (/\b(who|what) are you\b|\bare you (a |an )?(bot|robot|human|real|person|ai|machine)\b|\bchat ?gpt\b|\byour name\b/.test(q)) {
      return done(
        {
          blocks: [
            text(
              "I'm the Sharpe Wysman website assistant: an automated guide that answers from this site's own information, so I won't guess. I'm not a person, but our recruiters are a call away whenever you'd like to talk to one.",
            ),
          ],
          chips: ["Talk to a recruiter", "Show me current jobs"],
        },
        "identity",
      );
    }

    if (/^and for (employers|candidates)\??$/.test(q)) {
      const employer = q.includes("employers");
      const steps = employer ? kb.employerProcess : kb.candidateProcess;
      return done(
        {
          blocks: [
            { kind: "text", text: employer ? "For employers, a search runs like this:" : "For candidates, it works like this:" },
            { kind: "steps", steps },
            employer
              ? { kind: "actions", actions: [{ label: "Discuss a role", href: "/contact?topic=hire", primary: true }] }
              : { kind: "actions", actions: [{ label: "Browse jobs", href: "/jobs", primary: true }] },
          ],
          chips: employer ? ["How do your fees work?", "How quickly can you find someone?"] : ["Is it free for candidates?", "Show me current jobs"],
        },
        "process",
        { audience: employer ? "employer" : "candidate" },
      );
    }

    /* ---- conversational references to earlier jobs */
    const last = c.lastJob ? kb.jobs.find((j) => j.slug === c.lastJob) : undefined;
    const ord = q.match(/\b(first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last) (one|role|job|position)?\b/);
    if (ord && c.lastJobs.length) {
      const idx = { first: 0, "1st": 0, second: 1, "2nd": 1, third: 2, "3rd": 2, fourth: 3, "4th": 3, fifth: 4, "5th": 4, last: c.lastJobs.length - 1 }[ord[1]] ?? 0;
      const j = kb.jobs.find((x) => x.slug === c.lastJobs[idx]);
      if (j) return this.jobDetail(j, c, seed, done);
    }
    if (last && /^(tell me more|more( info| details)?|details|what else|go on|interesting|sounds good)$/.test(q)) return this.jobDetail(last, c, seed, done);
    if (last && /\b(salary|pay|how much|compensation|package)\b/.test(q) && !this.findJobByName(q)) {
      const s = salaryText(last);
      return done(
        {
          blocks: [
            text(
              s
                ? `The ${last.title} role pays **${s}**.`
                : `The salary for the ${last.title} role isn't published. We share it in a confidential conversation, along with the firm's name and full details.`,
            ),
            { kind: "actions", actions: [{ label: "Apply for this role", href: `/jobs/${last.slug}#apply`, primary: true }] },
          ],
          chips: ["How do I apply?", "Show me similar roles"],
        },
        "salary",
      );
    }
    if (last && /\b(where|location|located|office)\b/.test(q) && !/\byou\b/.test(q)) {
      return done({ blocks: [text(`The ${last.title} role is based in **${last.location}**.`)], chips: ["What's the salary?", "How do I apply?"] }, "jobloc");
    }
    if (last && /\b(what do i need|requirements?|qualifications?|qualified|need for it|experience (do i need|required)|looking for in)\b/.test(q)) {
      const r = requirementsReply(kb, c);
      if (r) return done(r, "requirements");
    }
    if (/\b(similar|other|more) (roles|jobs|positions)\b/.test(q)) {
      const pool = kb.jobs.filter((j) => j.slug !== c.lastJob && (!last || j.industry === last.industry));
      if (pool.length) return this.jobList(pool, c, seed, done, q, true);
    }
    if (/\b(how (do|can|should) i apply|apply|application)\b/.test(q)) {
      const target = this.findJobByName(q) ?? last;
      return done(
        {
          blocks: [
            text(
              target
                ? `You can apply for **${target.title}** directly on its page. It takes about two minutes: your name, email and resume (PDF or Word). A recruiter reviews every application personally, usually within two business days.`
                : "Every job page has a short application form: your name, email and resume, and it takes about two minutes. If no current role fits, you can register your resume and we'll call you when the right one appears.",
            ),
            {
              kind: "actions",
              actions: target
                ? [{ label: `Apply for ${target.title}`, href: `/jobs/${target.slug}#apply`, primary: true }]
                : [
                    { label: "Browse jobs", href: "/jobs", primary: true },
                    { label: "Register your resume", href: "/contact?topic=register" },
                  ],
            },
          ],
          chips: ["Is it free for candidates?", "Will my employer find out?"],
        },
        "apply",
      );
    }

    /* ---- glossary: standard profession terms */
    const term = GLOSSARY.find((g) => g.re.test(q));
    if (term && /\b(what|mean|meaning|stand for|explain|define|is)\b/.test(q)) {
      return done({ blocks: [text(term.text)], chips: ["Show me current jobs", "Which industries do you cover?"] }, "glossary");
    }

    /* ---- remote / hybrid */
    if (/\b(remote|hybrid|work from home|wfh|flexible working)\b/.test(q)) {
      return done(
        {
          blocks: [text("Our current roles are based in offices across Greater Vancouver. Working arrangements vary from firm to firm, so a recruiter can tell you exactly how flexible any specific role is.")],
          chips: ["Show me current jobs", "Talk to a recruiter"],
        },
        "remote",
      );
    }

    /* ---- specific job by name */
    const named = this.findJobByName(q);
    if (named && /\b(salary|pay|pays|how much|compensation|package)\b/.test(q)) {
      const sal = salaryText(named);
      return done(
        {
          blocks: [
            text(sal ? `The **${named.title}** role pays **${sal}**.` : `The salary for the **${named.title}** role isn't published. We share it in a confidential conversation, along with the firm's name.`),
            { kind: "actions", actions: [{ label: "View the role", href: `/jobs/${named.slug}`, primary: true }] },
          ],
          chips: ["What do I need for it?", "How do I apply?"],
        },
        "salary",
        { lastJob: named.slug, audience: "candidate" },
      );
    }
    if (named && !/\b(jobs|roles|positions|openings)\b/.test(q) && tokens(q).length <= 4 && tokens(q).every((t) => tokens(named.title).includes(t) || ["job", "manag", "senior"].includes(t))) {
      return this.jobDetail(named, c, seed, done);
    }
    if (named && /\b(tell|about|detail|more|what|describe|info|interested|role|job|position)\b|\?$/.test(q) && tokens(q).length <= 9) {
      const matches = this.matchJobs(q, raw);
      const browsing = /\b(jobs|roles|positions|openings|any|some|a (tax|audit|finance|accounting) (role|job|position))\b/.test(q);
      if (matches.length > 1 && (browsing || !/\b(the|this|that)\b/.test(q))) {
        return this.jobList(matches, c, seed, done, q);
      }
      return this.jobDetail(named, c, seed, done);
    }

    /* ---- career advice → articles */
    if (/\b(advice|tips?|guide|article|blog|insights?|public practice|move (from|to|into)|should i (move|leave|switch|take|accept)|partner.track|choose a recruiter|career (change|move|advice))\b/.test(q)) {
      const hits = this.bm25(tokens(q)).filter((h) => h.d.id.startsWith("article:") && h.score > 0.5);
      if (hits.length) return done({ blocks: hits[0].d.answer, chips: ["Show me current jobs", "Talk to a recruiter"] }, "article");
    }

    /* ---- fees */
    if (/\b(fee|fees|cost|costs|charge|price|pricing|rates?|free|pay you|commission)\b/.test(q)) {
      const employer = c.audience === "employer" || /\b(employer|company|firm|we|our|hire|hiring|placement fee|retained|contingency)\b/.test(q);
      const faq = kb.faqs.find((f) => f.id === (employer ? "fees" : "candidate-fee"));
      return done(
        {
          blocks: [
            text(
              employer
                ? faq?.answer ?? "Fees depend on the service and the role. We'll walk you through the options."
                : `It's completely free for candidates. ${(faq?.answer ?? "").replace(/^No\.\s*/, "")}`.trim(),
            ),
            employer
              ? { kind: "actions", actions: [{ label: "Discuss a role", href: "/contact?topic=hire", primary: true }] }
              : { kind: "actions", actions: [{ label: "Browse jobs", href: "/jobs", primary: true }] },
          ],
          chips: employer ? ["What services do you offer?", "How quickly can you find someone?"] : ["Will my employer find out?", "Show me current jobs"],
        },
        "fees",
      );
    }

    /* ---- confidentiality */
    if (/\b(confidential\w*|privacy|private|discreet|current (employer|boss|firm)|find out|my boss|secret|share my (resume|cv|details))\b/.test(q)) {
      const faq = kb.faqs.find((f) => f.id === "confidential");
      return done(
        {
          blocks: [text(faq?.answer ?? "Every conversation is confidential."), text("For senior searches, we also keep the employer's identity confidential until both sides are ready.")],
          chips: ["How do I apply?", "Show me current jobs"],
        },
        "confidential",
      );
    }

    /* ---- timing */
    if (/\b(how (long|quickly|fast|soon)|timeline|turnaround|time to (hire|fill)|when will)\b/.test(q)) {
      const employer = c.audience !== "candidate" && !/\b(hear back|reply|respond|application)\b/.test(q);
      const faq = kb.faqs.find((f) => f.id === "how-long");
      return done(
        {
          blocks: [
            text(
              employer
                ? faq?.answer ?? "It depends on the role and the market."
                : "We reply to every application personally, usually within two business days, and to messages within one business day.",
            ),
          ],
          chips: employer ? ["What's your process?", "How do your fees work?"] : ["How do I apply?", "Show me current jobs"],
        },
        "timing",
      );
    }

    /* ---- jobs search */
    const industry = this.detectIndustry(q);
    const wantsJobs = /\b(jobs?|roles?|positions?|openings?|vacanc\w*|opportunit\w*|hiring now|currently (hiring|recruiting)|available)\b/.test(q) && !/\b(i'?m|we'?re|we are|i am) hiring\b|\bneed to hire\b|\bhelp (me|us) hire\b/.test(q);
    const salaryAsk = /\b(salary|salaries|pay|how much|over|above|at least|more than)\b.*\d|\d+\s?k\b/.test(q);
    if (wantsJobs || salaryAsk || /^show me (current )?jobs?$/.test(q)) {
      const GENERIC = new Set(["job", "legal", "it", "humanresourc", "humanresources", "engineering", "any", "current", "open", "have", "list", "all", "available", "show", "see"]);
      const specific = tokens(q).filter((t) => !GENERIC.has(t) && !t.startsWith("account"));
      let list = industry && !specific.length && !salaryAsk ? kb.jobs.filter((j) => j.industry === industry.slug) : this.matchJobs(q, raw);
      if (industry && !list.length && !salaryAsk) list = kb.jobs.filter((j) => j.industry === industry.slug);
      const generic = !list.length && !salaryAsk && (!industry || industry.slug === "accounting");
      if (generic) list = kb.jobs;
      if (!list.length) {
        const ind = industry ?? kb.industries[0];
        return done(
          {
            blocks: [
              text(
                salaryAsk
                  ? "None of our advertised roles match that salary right now, but many searches are confidential and never advertised."
                  : `We don't have advertised ${ind.name.toLowerCase()} roles at the moment, but many of our searches are confidential and never advertised.`,
              ),
              text("If you register your resume, a recruiter will contact you as soon as something suitable comes in."),
              { kind: "actions", actions: [{ label: "Register your resume", href: "/contact?topic=register", primary: true }, { label: "See all jobs", href: "/jobs" }] },
            ],
            chips: ["Show me all jobs", "Is it free for candidates?"],
          },
          "jobs-none",
          { audience: "candidate" },
        );
      }
      return this.jobList(list, c, seed, done, q, generic);
    }

    /* ---- employer wants to hire */
    if (/\b(i|we)('?m|'?re| am| are)? (need|want|looking) to hire\b|\b(we'?re|we are|i'?m|i am) hiring\b|\bhelp (me|us) (hire|find)\b|\bfill (a|the|our) (role|position|vacancy)\b|^i'?m hiring$/.test(q)) {
      return done(
        {
          blocks: [
            text(
              `${hey}${cap(pick(["Wonderful, that's exactly what we do.", "Great, you're in the right place."], seed))} Every recruiter on our team is a designated accountant, so we screen on substance, not keywords, and you only meet candidates we've pre-qualified for your role.`,
            ),
            text("There are three ways to work with us:"),
            { kind: "steps", steps: kb.services.map((s) => ({ title: s.title, body: `${s.lede} Best for ${s.bestFor.toLowerCase()}.` })) },
            { kind: "actions", actions: [{ label: "Discuss a role", href: "/contact?topic=hire", primary: true }, { label: "How we work with employers", href: "/employers" }] },
          ],
          chips: ["How do your fees work?", "How quickly can you find someone?", "What's your process?"],
        },
        "hire",
        { audience: "employer" },
      );
    }

    /* ---- process */
    if (/\b(process|steps?|how (does it|do you|does this) work|what happens( next)?|how it works|walk me through)\b/.test(q)) {
      const employer = c.audience === "employer" || /\b(employer|hire|hiring|firm|company|we)\b/.test(q);
      const steps = employer ? kb.employerProcess : kb.candidateProcess;
      return done(
        {
          blocks: [
            text(employer ? "Here's how a search works for employers, from first call to long after the start date:" : "Here's what happens when you work with us as a candidate:"),
            { kind: "steps", steps },
            employer
              ? { kind: "actions", actions: [{ label: "Discuss a role", href: "/contact?topic=hire", primary: true }] }
              : { kind: "actions", actions: [{ label: "Browse jobs", href: "/jobs", primary: true }, { label: "Register your resume", href: "/contact?topic=register" }] },
          ],
          chips: employer ? ["How do your fees work?", "How quickly can you find someone?", "And for candidates?"] : ["Is it free for candidates?", "Will my employer find out?", "And for employers?"],
        },
        "process",
        { audience: employer ? "employer" : c.audience ?? "candidate" },
      );
    }

    /* ---- services */
    if (/\b(services?|retained|contingency|search and selection|workplace consulting|what do you (offer|do)|how can you help)\b/.test(q)) {
      return done(
        {
          blocks: [text("We offer three ways to hire with us:"), { kind: "steps", steps: kb.services.map((s) => ({ title: s.title, body: `${s.lede} ${s.body}` })) }, { kind: "actions", actions: [{ label: "Compare services", href: "/employers#services", primary: true }] }],
          chips: ["How do your fees work?", "What's your process?"],
        },
        "services",
        { audience: "employer" },
      );
    }

    /* ---- industries */
    if (industry && /\b(do you|recruit|cover|work|industr|sector|specialt|about|tell)\b/.test(q)) {
      const roles = kb.jobs.filter((j) => j.industry === industry.slug);
      return done(
        {
          blocks: [
            text(`**${industry.name}.** ${industry.tagline} ${industry.intro.split(". ").slice(0, 2).join(". ")}.`),
            text(`Specialties include ${listText(industry.specialisms.map((s) => s.toLowerCase()))}.`),
            { kind: "actions", actions: [{ label: `Explore ${industry.name}`, href: `/industries/${industry.slug}`, primary: true }, ...(roles.length ? [{ label: `${roles.length} open roles`, href: "/jobs" }] : [])] },
          ],
          chips: roles.length ? [`Show me ${industry.navLabel.toLowerCase()} jobs`, "How does it work?"] : ["Register my resume", "Which industries do you cover?"],
        },
        "industry",
      );
    }
    if (/\b(industr\w*|sectors?|fields?|specialt\w*|what (kind|type)s? of (roles|jobs|positions)|who do you recruit)\b/.test(q)) {
      return done(
        {
          blocks: [
            text("Accounting and finance is our specialty, in public practice and in industry. We also recruit for the teams that work alongside them:"),
            { kind: "steps", steps: kb.industries.map((i) => ({ title: i.name, body: i.tagline })) },
          ],
          chips: kb.industries.slice(0, 3).map((i) => `Tell me about ${i.navLabel.toLowerCase()}`),
        },
        "industries",
      );
    }

    /* ---- about / founder / team */
    if (/\b(founder|sukhjit|owner|who (runs|owns|started|founded)|history|background|about (you|the company|sharpe|the firm)|when (were you|was it) founded|how long have you)\b/.test(q)) {
      return done(
        {
          blocks: [
            text(`Sharpe Wysman was founded in ${kb.founded} by **${kb.founder.name}**. ${kb.founder.bio[0]}`),
            text("He started the firm to bring more integrity and expertise to recruitment, and every recruiter on the team is a designated accountant."),
            { kind: "actions", actions: [{ label: "Our story and values", href: "/about", primary: true }] },
          ],
          chips: ["Who's on the team?", "What do clients say?"],
        },
        "about",
      );
    }
    if (/\b(team|recruiters?|who (will|would) i (work|speak|talk)|staff|sonia|people at)\b/.test(q)) {
      return done(
        {
          blocks: [
            text(`You'll speak directly to an experienced recruiter. The team includes ${listText(kb.team.map((t) => `**${t.name}** (${t.role})`))}.`),
            { kind: "actions", actions: [{ label: "Meet the team", href: "/team", primary: true }, ...kb.team.filter((t) => t.phone).slice(0, 1).map((t) => ({ label: `Call ${t.phone}`, href: `tel:+1${t.phone!.replace(/\D/g, "")}` }))] },
          ],
          chips: ["Who founded Sharpe Wysman?", "How do I contact you?"],
        },
        "team",
      );
    }

    /* ---- testimonials */
    if (/\b(reviews?|testimonials?|references?|clients? say|reputation|trust (you|them)|good|recommend)\b/.test(q) && !/\bgood (morning|afternoon|evening)\b/.test(q)) {
      const pool = kb.testimonials.filter((t) => (c.audience === "employer" ? t.audience === "client" : c.audience === "candidate" ? t.audience === "candidate" : true));
      const t = pick(pool.length ? pool : kb.testimonials, seed);
      return done(
        {
          blocks: [text("Here's what one of the people we've worked with said:"), { kind: "quote", quote: t.quote, by: `${t.name}, ${t.role}, ${t.company}` }, { kind: "actions", actions: [{ label: "Read all testimonials", href: "/testimonials" }] }],
          chips: ["Another one", "How does it work?"],
        },
        "testimonial",
      );
    }
    if (/^(another( one)?|one more|more)$/.test(q) && c.lastIntent === "testimonial") {
      const t = pick(kb.testimonials, seed + 3);
      return done({ blocks: [{ kind: "quote", quote: t.quote, by: `${t.name}, ${t.role}, ${t.company}` }], chips: ["Another one", "Talk to a recruiter"] }, "testimonial");
    }

    /* ---- location */
    if (/\b(where are you|located|location|office|address|areas?|cover|based|which cities|surrey|burnaby|richmond|north shore|remote)\b/.test(q)) {
      const faq = kb.faqs.find((f) => f.id === "where");
      return done({ blocks: [text(faq?.answer ?? "We're based in Vancouver and work across Greater Vancouver."), contact], chips: ["Show me current jobs", "Who's on the team?"] }, "location");
    }

    /* ---- contact / human handoff */
    if (/\b(talk|speak|chat) (to|with) (a |an )?(someone|somebody|person|human|recruiter|real)|\bcall (me|you)\b|\b(phone|telephone|number|email|e-mail|contact|reach (you|someone))\b|^talk to a recruiter$/.test(q)) {
      return done(
        {
          blocks: [
            text(
              `${hey}${cap("Of course.")} You can call ${kb.team[0]?.name.split(" ")[0] ?? "us"} directly on **${kb.settings.phone}**${kb.settings.email ? `, email **${kb.settings.email}**` : ""}, or send a message and a recruiter will reply within one business day.`,
            ),
            contact,
          ],
        },
        "contact",
      );
    }

    /* ---- register */
    if (/\b(register|send (you )?my (resume|cv)|submit my (resume|cv)|upload|keep me in mind|job alerts?|notify me|let me know)\b/.test(q)) {
      return done(
        {
          blocks: [
            text("Registering takes a minute: tell us what you're looking for and attach your resume. It stays confidential, and a recruiter will contact you when a suitable role comes in, including searches that are never advertised."),
            { kind: "actions", actions: [{ label: "Register your resume", href: "/contact?topic=register", primary: true }] },
          ],
          chips: ["Is it free for candidates?", "Will my employer find out?"],
        },
        "register",
        { audience: "candidate" },
      );
    }

    /* ---- open retrieval */
    const qt = tokens(q);
    const hits = this.bm25(qt);
    const top = hits[0];
    const overlap = top ? new Set(qt.filter((t) => top.d.tokens.includes(t))).size : 0;
    if (top && top.score >= 1.6 && (overlap >= 2 || (qt.length === 1 && top.score >= 3)) && (hits.length < 2 || top.score >= hits[1].score * 1.05 || top.score > 3)) {
      return done(
        {
          blocks: [text(pick(["Here's what I can tell you:", "Good question.", "Here's the short answer:"], seed)), ...top.d.answer],
          chips: top.d.chips ?? ["Show me current jobs", "Talk to a recruiter"],
        },
        "retrieval",
      );
    }

    /* ---- honest fallback */
    return done(
      {
        blocks: [
          text(
            pick(
              [
                "I'm not certain I've understood that, and I'd rather not guess.",
                "That's outside what I can answer reliably, and I don't want to give you the wrong information.",
              ],
              seed,
            ) + " I can help with our current jobs, how we work with employers and candidates, fees, confidentiality, and our industries. Or a recruiter can answer directly.",
          ),
          contact,
        ],
        chips: ["Show me current jobs", "I'm hiring", "How does it work?"],
      },
      "fallback",
    );
  }

  private jobList(list: KBJob[], c: Ctx, seed: number, done: (r: Reply, i: string, p?: Partial<Ctx>) => { reply: Reply; ctx: Ctx }, q: string, generic = false) {
    const shown = list.slice(0, 4);
    const n = list.length;
    const intro = generic
      ? pick([`We're recruiting for **${n} roles** right now. Here are a few:`, `There are **${n} open roles** at the moment. Here are some highlights:`], seed)
      : n === 1
        ? "I found one role that matches:"
        : `I found **${n} roles** that match${/\d/.test(q) ? " that salary" : ""}:`;
    return done(
      {
        blocks: [
          { kind: "text", text: intro },
          { kind: "jobs", jobs: shown },
          ...(n > shown.length ? [{ kind: "actions" as const, actions: [{ label: `See all ${n} roles`, href: "/jobs" }] }] : []),
        ],
        chips: [`Tell me about the ${shown[0]?.title}`, "Which pay over $120k?", "How do I apply?"].filter((x) => !x.includes("undefined")),
      },
      "jobs",
      { lastJobs: shown.map((j) => j.slug), lastJob: shown.length === 1 ? shown[0].slug : c.lastJob, audience: c.audience ?? "candidate" },
    );
  }

  private jobDetail(j: KBJob, c: Ctx, seed: number, done: (r: Reply, i: string, p?: Partial<Ctx>) => { reply: Reply; ctx: Ctx }) {
    const s = salaryText(j);
    return done(
      {
        blocks: [
          { kind: "text", text: `${pick(["Here's the overview of", "Happy to. Here's", "Sure. Here's"], seed)} the **${j.title}** role in ${j.location}. ${j.summary}` },
          ...(j.highlights.length ? [{ kind: "steps" as const, steps: j.highlights.slice(0, 4).map((h) => ({ title: h, body: "" })) }] : []),
          { kind: "text", text: s ? `Salary: **${s}**.` : "The salary is shared in a confidential conversation." },
          {
            kind: "actions",
            actions: [
              { label: "Apply for this role", href: `/jobs/${j.slug}#apply`, primary: true },
              { label: "View full details", href: `/jobs/${j.slug}` },
            ],
          },
        ],
        chips: ["What do I need for it?", "Show me similar roles", "Will my employer find out?"],
      },
      "job",
      { lastJob: j.slug, audience: "candidate" },
    );
  }
}

/* ------------------------------------------------------------ helpers */

const GLOSSARY: { re: RegExp; text: string }[] = [
  { re: /\baspe\b/, text: "**ASPE** stands for Accounting Standards for Private Enterprises, the Canadian framework most private companies use for their financial statements. Many audit and compilation roles we recruit for ask for ASPE experience." },
  { re: /\bifrs\b/, text: "**IFRS** (International Financial Reporting Standards) is the framework Canadian public companies report under. It's the key requirement for public company (pubco) audit and reporting roles." },
  { re: /\b(us )?gaap\b/, text: "**US GAAP** is the American accounting framework. It's relevant for Canadian companies with US parents or listings, and for cross-border tax and reporting roles." },
  { re: /\bcpa\b/, text: "**CPA** stands for Chartered Professional Accountant, Canada's unified accounting designation. Every recruiter on our team is a designated accountant, so we understand the path well." },
  { re: /\bin.?depth tax\b/, text: "The **In-Depth Tax Course** is CPA Canada's advanced, multi-level tax program. Tax roles often ask for Levels I and II, and senior roles for all three." },
  { re: /\bbig (4|four)\b/, text: "The **Big 4** are the four largest professional services firms: Deloitte, EY, KPMG and PwC. Our founder qualified with PwC and also worked at EY." },
  { re: /\bpubco\b/, text: "**Pubco** is shorthand for public company. Pubco audit roles involve auditing companies listed on a stock exchange, usually under IFRS." },
  { re: /\bcompilations?\b/, text: "A **compilation engagement** is when an accountant prepares financial statements for a client without auditing or reviewing them. It's common work in small and mid-size CPA firms." },
];

function listText(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function salaryFloor(raw: string): number | null {
  const s = raw.toLowerCase().replace(/,/g, "");
  const m = s.match(/(\d{2,3})\s?k\b/) ?? s.match(/\$?(\d{5,6})\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return n < 1000 ? n * 1000 : n;
}

/** Requirements follow-up ("what do I need?") handled by a tiny post-processor. */
export function requirementsReply(kb: AssistantKB, ctx: Ctx): Reply | null {
  const j = ctx.lastJob ? kb.jobs.find((x) => x.slug === ctx.lastJob) : undefined;
  if (!j) return null;
  return {
    blocks: j.requirements.length
      ? [{ kind: "text", text: `For the **${j.title}** role, the client is looking for:` }, { kind: "steps", steps: j.requirements.map((r) => ({ title: r, body: "" })) }, { kind: "actions", actions: [{ label: "Apply for this role", href: `/jobs/${j.slug}#apply`, primary: true }] }]
      : [{ kind: "text", text: `The ${j.title} role doesn't list formal requirements beyond relevant experience. A recruiter can tell you more in a confidential call.` }],
    chips: ["What's the salary?", "How do I apply?"],
  };
}
