import { JsonLd, PageHero } from "@/option-2/components/ui";
import { TeamGrid } from "@/option-2/components/TeamGrid";
import { CtaBand } from "@/option-2/components/CtaBand";
import { getTeam } from "@/option-2/wp";
import { breadcrumbLd, buildMetadata, personLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Our Team of Accounting Recruiters",
  description: "Meet the Sharpe Wysman team: experienced Vancouver recruiters who are designated accountants, led by founder Sukhjit Singh Lalli.",
  path: "/team",
});

export default async function TeamPage() {
  const team = await getTeam();
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Team", path: "/team" }]), ...team.map((m, i) => personLd(m, i === 0))]} />
      <PageHero
        eyebrow="Our team"
        title={
          <>
            Speak to a recruiter <span className="text-gold">who knows your world.</span>
          </>
        }
        intro="A small, experienced team. When you call, you speak directly to the person running your search."
        image="/images/team-meeting.jpg"
        caption="Not a call centre. The person running your search."
      />
      <section className="py-12 md:py-16">
        <h2 className="sr-only">Our recruiters</h2>
        <div className="container-sw">
          <TeamGrid team={team} detailed />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
