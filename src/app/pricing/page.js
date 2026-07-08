import PageHero from "@/components/PageHero";
import CTAButton from "@/components/CTAButton";
import PricingTiers from "@/sections/pricing/PricingTiers";
import PricingComparison from "@/sections/pricing/PricingComparison";
import PricingFAQ from "@/sections/pricing/PricingFAQ";

export const metadata = {
  title: "Pricing · Agency 1776 Business",
  description:
    "Three ways to work with the studio — Sprint, Retainer, or a bespoke Systems build.",
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Engagements"
        index="005"
        backdrop="pulse"
        heading={{
          lead: "Three ways",
          tail: "to work together.",
          accent: "No mystery fees.",
        }}
        description={[
          "Sprint, Retainer, or a bespoke Systems build.",
          "Every number below is the starting point — scope moves it up, never down.",
        ]}
      >
        <CTAButton href="/contact" size="lg">
          Book a call
        </CTAButton>
      </PageHero>
      <PricingTiers />
      <PricingComparison />
      <PricingFAQ />
    </>
  );
}
