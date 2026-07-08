import PageHero from "@/components/PageHero";
import ContactForm from "@/sections/contact/ContactForm";
import ContactChannels from "@/sections/contact/ContactChannels";
import ContactStudios from "@/sections/contact/ContactStudios";

export const metadata = {
  title: "Contact · Agency 1776 Business",
  description:
    "Tell us what you're building. We reply to every message within one working day.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        index="006"
        backdrop="directional"
        heading={{
          lead: "Tell us what",
          tail: "you're building.",
          accent: "Short notes welcome.",
        }}
        description={[
          "We reply to every message within one working day.",
          "Time-zones covered: NYC, London, Tokyo.",
        ]}
      />
      <ContactForm />
      <ContactChannels />
      <ContactStudios />
    </>
  );
}
