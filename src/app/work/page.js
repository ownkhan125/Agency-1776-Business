import PageHero from "@/components/PageHero";
import CTAButton from "@/components/CTAButton";
import WorkGrid from "@/sections/work/WorkGrid";
import WorkClients from "@/sections/work/WorkClients";

export const metadata = {
  title: "Selected work · Agency 1776 Business",
  description:
    "Three engagements we can walk through — the problem, the approach, the numbers.",
};

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Selected work"
        index="003"
        backdrop="sweep"
        heading={{
          lead: "Three engagements",
          tail: "we can walk through.",
          accent: "The rest is under NDA.",
        }}
        description={[
          "Every case study lists the metric we were hired to move,",
          "the number we posted, and the stack that shipped.",
        ]}
      >
        <CTAButton href="/contact" size="lg">
          Discuss a project
        </CTAButton>
      </PageHero>
      <WorkGrid />
      <WorkClients />
    </>
  );
}
