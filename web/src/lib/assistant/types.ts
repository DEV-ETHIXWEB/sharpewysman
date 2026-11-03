import type { Faq } from "../types";

export interface KBJob {
  slug: string;
  title: string;
  location: string;
  city: string;
  industry: string;
  summary: string;
  highlights: string[];
  requirements: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryNote?: string;
}

export interface AssistantKB {
  jobs: KBJob[];
  industries: { slug: string; name: string; navLabel: string; tagline: string; intro: string; specialisms: string[]; roles: string[]; primary: boolean }[];
  faqs: Faq[];
  team: { slug: string; name: string; role: string; phone?: string; email?: string }[];
  settings: { phone: string; phoneHref: string; email?: string; linkedin: string };
  services: { slug: string; title: string; lede: string; body: string; bestFor: string }[];
  employerProcess: { title: string; body: string }[];
  candidateProcess: { title: string; body: string }[];
  articles: { slug: string; title: string; excerpt: string }[];
  testimonials: { quote: string; name: string; role: string; company: string; audience: "client" | "candidate" }[];
  founded: number;
  founder: { name: string; bio: string[] };
}

export type Block =
  | { kind: "text"; text: string }
  | { kind: "jobs"; jobs: KBJob[] }
  | { kind: "steps"; steps: { title: string; body: string }[] }
  | { kind: "actions"; actions: { label: string; href: string; primary?: boolean }[] }
  | { kind: "quote"; quote: string; by: string };

export interface Reply {
  blocks: Block[];
  chips?: string[];
}

export interface Ctx {
  turn: number;
  name?: string;
  audience?: "candidate" | "employer";
  lastJobs: string[];
  lastJob?: string;
  lastIntent?: string;
}

export const emptyCtx = (): Ctx => ({ turn: 0, lastJobs: [] });
