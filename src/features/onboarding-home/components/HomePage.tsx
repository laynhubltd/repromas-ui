import { useLandingPage } from '../hooks/use-landing-page';
import { CtaSection } from './sections/CtaSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { HeroSection } from './sections/HeroSection';
import { ModulesSection } from './sections/ModulesSection';

export default function HomePage() {
  const { hero, modules, features, cta, token, breakpoints } = useLandingPage();

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <HeroSection hero={hero} token={token} breakpoints={breakpoints} />
      <ModulesSection modules={modules} token={token} breakpoints={breakpoints} />
      <FeaturesSection features={features} token={token} breakpoints={breakpoints} />
      <CtaSection cta={cta} token={token} breakpoints={breakpoints} />
    </div>
  );
}
