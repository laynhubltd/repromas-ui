import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { MarketingFinalCta } from "@/shared/ui/marketing";
import { PageSEO } from "@/shared/ui/PageSEO";
import { useHomePage } from "../hooks/useHomePage";
import { HeroSection } from "./sections/HeroSection";
import { InsightsSection } from "./sections/InsightsSection";
import { ModulesSection } from "./sections/ModulesSection";
import { ProductAreasSection } from "./sections/ProductAreasSection";
import { StatsSection } from "./sections/StatsSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { TrustedSection } from "./sections/TrustedSection";
import { VerifySection } from "./sections/VerifySection";
import { WhySection } from "./sections/WhySection";

export default function HomePage() {
  const { seo, links, content, flags } = useHomePage();

  return (
    <>
      <PageSEO title={seo.title} description={seo.description} />
      <HeroSection hero={content.hero} journey={content.journey} advisorUrl={links.advisor} />
      <ConditionalRenderer when={flags.showTrusted}>
        <TrustedSection institutions={content.trusted} />
      </ConditionalRenderer>
      <ModulesSection
        heading={content.modulesHeading}
        lanes={content.moduleLanes}
        foundation={content.moduleFoundation}
        allModulesUrl={links.platform}
      />
      <StatsSection stats={content.stats} />
      <ProductAreasSection heading={content.areasHeading} areas={content.areas} />
      <WhySection why={content.why} cards={content.whyCards} demoUrl={links.demo} />
      <VerifySection heading={content.verifyHeading} cards={content.verifyCards} contactUrl={links.advisor} />
      <ConditionalRenderer when={flags.showTestimonials}>
        <TestimonialsSection testimonials={content.testimonials} />
      </ConditionalRenderer>
      <ConditionalRenderer when={flags.showGuides}>
        <InsightsSection guides={content.guides} />
      </ConditionalRenderer>
      <MarketingFinalCta
        id="demo"
        title={content.finalCta.title}
        text={content.finalCta.text}
        actions={[
          { label: "Book a Demo", to: links.demo, variant: "cta" },
          { label: "Talk to an Advisor", to: links.advisor, variant: "outline" },
        ]}
        fineprint="Free 90-day pilot. No procurement needed to start."
      />
    </>
  );
}
