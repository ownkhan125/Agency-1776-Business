import PageHero from "@/components/PageHero";
import AboutStats from "@/sections/about/AboutStats";
import AboutPrinciples from "@/sections/about/AboutPrinciples";
import AboutTimeline from "@/sections/about/AboutTimeline";
import AboutTeam from "@/sections/about/AboutTeam";
import AboutContact from "@/sections/about/AboutContact";

export const metadata = {
  title: "About · Agency 1776 Business",
  description:
    "A small studio built around one belief: thoughtful software is still a competitive advantage.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        index="01"
        backdrop="beams"
        heading={{
          lead: "A small studio",
          tail: "built around one belief:",
          accent: "software is still an edge.",
        }}
        description={[
          "Two designers and three engineers who ship as one team.",
          "Founded in 2024. Booked through Q4.",
          "Every engagement gets a senior in the room, every day.",
        ]}
      />
      <AboutStats />
      <AboutPrinciples />
      <AboutTimeline />
      <AboutTeam />
      <AboutContact />
    </>
  );
}
