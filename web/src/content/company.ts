import type { Faq } from "../lib/types";

export const services = [
  {
    slug: "search-and-selection",
    title: "Search and selection",
    lede: "Hiring a senior executive or a hard-to-find skill set?",
    body: "Outsource the recruitment entirely to us. We handle everything from inception to offer: identifying and headhunting the top talent, acting as ambassadors for your business in the candidate market, and delivering the best people for you to meet.",
    bestFor: "Leadership hires and confidential searches",
  },
  {
    slug: "contingency-search",
    title: "Contingency search",
    lede: "Need extra support alongside your own direct search?",
    body: "We give you access to the parts of the talent market you can't reach on your own. With a vast network of candidates, we widen your pool and effectively augment your search.",
    bestFor: "Mid-level roles and widening your pool",
  },
  {
    slug: "workplace-consulting",
    title: "Workplace consulting",
    lede: "Wondering how best to structure your team?",
    body: "Want to make the most of your existing resources, or have a unique workplace concern? We'll advise you on how to maximize your current situation, overcome challenges, and identify risks or gaps within your organization.",
    bestFor: "Team structure, succession and growth plans",
  },
] as const;

export const employerProcess = [
  {
    title: "Initial consultation",
    body: "A thorough conversation about your hiring needs, company culture and team dynamics, so our search reflects your goals and values.",
  },
  {
    title: "Sourcing and vetting",
    body: "We use our network and industry resources to reach qualified candidates who are otherwise out of reach, and screen every one against your role and culture.",
  },
  {
    title: "Curated shortlist",
    body: "You receive a short list of the strongest candidates, each with the insight you need to decide quickly. Only the most suitable people reach you.",
  },
  {
    title: "Placement and follow-up",
    body: "We stay in touch through onboarding, gather feedback from you and your new hire, and resolve any concerns early so the fit lasts.",
  },
] as const;

export const candidateProcess = [
  {
    title: "Initial consultation",
    body: "An in-depth conversation about your goals, skills and preferences, so every opportunity we bring you fits where you want to go.",
  },
  {
    title: "Resume refinement",
    body: "We help you present your credentials clearly, so your strengths and achievements stand out to the right employers.",
  },
  {
    title: "Screening and interviews",
    body: "We get to know your experience properly, so we can match you only with roles that suit your qualifications and ambitions.",
  },
  {
    title: "Job matching",
    body: "We recommend positions that match your skills today and support your long-term growth, including roles that are never advertised.",
  },
  {
    title: "Interview coordination",
    body: "We schedule your interviews and prepare you with company insight, role expectations and coaching on the difficult questions.",
  },
  {
    title: "Offer and placement",
    body: "We guide you through the offer, negotiation and contract review, and support you as you settle into your new role.",
  },
] as const;

export const values = [
  {
    title: "Integrity",
    body: "We are always honest and will never mislead the employer or the candidate. We won't push anyone to make or accept an offer.",
  },
  {
    title: "Expertise",
    body: "We have a vast network of quality candidates. Using our own accounting backgrounds, we take the time to understand the role and the fit.",
  },
  {
    title: "Professionalism",
    body: "We provide knowledgeable, timely advice throughout the recruitment process.",
  },
  {
    title: "Respect",
    body: "We value diversity and show regard for one another, our clients and our candidates.",
  },
  {
    title: "Teamwork",
    body: "We work together towards common goals, because we accomplish more as a group than we can separately.",
  },
  {
    title: "Flexibility",
    body: "We are adaptable and responsive, and we move quickly when a search or a situation calls for it.",
  },
] as const;

export const faqs: Faq[] = [
  {
    id: "candidate-fee",
    audience: "candidate",
    question: "Do candidates pay anything to work with Sharpe Wysman?",
    answer:
      "No. Our fees are paid by the hiring employer, so our help with your search, resume, interview preparation and offer negotiation costs you nothing.",
  },
  {
    id: "confidential",
    audience: "candidate",
    question: "Will my current employer find out I'm looking?",
    answer:
      "Not from us. We treat every conversation as confidential and never share your resume with an employer without your explicit permission for that specific role.",
  },
  {
    id: "unadvertised",
    audience: "candidate",
    question: "Are all of your roles advertised on this site?",
    answer:
      "No. Many of our searches are confidential and never advertised. If you register with us, we can tell you about suitable roles as soon as they come up.",
  },
  {
    id: "which-roles",
    audience: "general",
    question: "What kinds of roles do you recruit for?",
    answer:
      "We specialize in mid-level to leadership positions in accounting and finance, in public practice and in industry: audit and assurance, Canadian and US tax, controllers, directors of finance, CFOs and partner-track roles. We also recruit in legal, IT, HR and engineering.",
  },
  {
    id: "where",
    audience: "general",
    question: "Which areas do you cover?",
    answer:
      "We're based in Vancouver and work with employers and candidates across Greater Vancouver, including Surrey, Burnaby, Richmond and the North Shore.",
  },
  {
    id: "why-accountants",
    audience: "employer",
    question: "Why does it matter that your recruiters are accountants?",
    answer:
      "Because we understand the work. We know the difference between ASPE and IFRS experience, what In-Depth Tax levels mean, and what a partner-track candidate really needs. That means better screening and fewer wasted interviews for you.",
  },
  {
    id: "how-long",
    audience: "employer",
    question: "How quickly can you present candidates?",
    answer:
      "It depends on the role and the market, but our network means we can usually start conversations with suitable candidates as soon as we've understood your brief. We'll give you a realistic timeline at the initial consultation.",
  },
  {
    id: "fees",
    audience: "employer",
    question: "How do your fees work?",
    answer:
      "For contingency search you pay only when you hire a candidate we introduce. Retained search and workplace consulting are scoped with you up front. Contact us and we'll walk you through the options for your role.",
  },
];
