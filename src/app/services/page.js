import PageHero from "@/components/PageHero";
import CTAButton from "@/components/CTAButton";
import ServicesGrid from "@/sections/services/ServicesGrid";
import ServicesProcess from "@/sections/services/ServicesProcess";
import ServicesFAQ from "@/sections/services/ServicesFAQ";

export const metadata = {
  title: "Services · Agency 1776 Business",
  description:
    "Website strategy, design, development, copy, lead generation, and SEO — a focused set of services built for business growth.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        index="004"
        backdrop="scan"
        heading={{
          lead: "Services for your",
          tail: "business",
          accent: "growth.",
        }}
        description={[
          "Agency 1776 gives business owners the pieces they need to build a stronger website from the ground up.",
          "A focused set of website services built to make your business clearer, more credible, and easier to contact.",
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
