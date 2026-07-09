import Hero from "@/sections/Hero";
import ValueGrid from "@/sections/ValueGrid";
import Services from "@/sections/Services";
import Audience from "@/sections/Audience";
import About from "@/sections/About";
import Portfolio from "@/sections/Portfolio";
import Pricing from "@/sections/Pricing";
import Contact from "@/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <ValueGrid />
      <Services />
      <Audience />
      <About />
      <Portfolio />
      <Pricing />
      <Contact />
    </>
  );
}
