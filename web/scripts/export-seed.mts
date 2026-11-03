/**
 * Exports the bundled launch content to the WordPress plugin's seed.json,
 * which the plugin imports once on activation.
 * Run: npm run seed:export
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { jobs } from "../src/content/jobs.ts";
import { testimonials, team } from "../src/content/people.ts";
import { industries } from "../src/content/industries.ts";
import { faqs } from "../src/content/company.ts";
import { articles } from "../src/content/articles.ts";

const out = fileURLToPath(new URL("../../wordpress/sharpe-wysman-headless/seed.json", import.meta.url));
writeFileSync(out, JSON.stringify({ jobs, testimonials, team, industries, faqs, articles }, null, 2) + "\n");
console.log(`Wrote ${out}`);
