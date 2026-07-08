import PageHero from "@/components/PageHero";
import CTAButton from "@/components/CTAButton";
import ServicesGrid from "@/sections/services/ServicesGrid";
import ServicesProcess from "@/sections/services/ServicesProcess";
import ServicesFAQ from "@/sections/services/ServicesFAQ";

export const metadata = {
  title: "Services · Agency 1776 Business",
  description:
    "Product design, brand, engineering, and motion — four disciplines, one senior team.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        index="004"
        backdrop="scan"
        heading={{
          lead: "Four disciplines,",
          tail: "one senior team.",
          accent: "No handoff friction.",
        }}
        description={[
          "We commit senior time to every day of every engagement.",
          "That is how the work gets deep enough to move a metric.",
        ]}
      >
        <CTAButton href="/contact" size="lg">
          Start a project
        </CTAButton>
      </PageHero>
      <ServicesGrid />
      <ServicesProcess />
      <ServicesFAQ />
    </>
  );
}
