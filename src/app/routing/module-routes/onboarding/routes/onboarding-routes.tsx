import { AboutPage } from "@/features/onboarding-about";
import { ContactPage } from "@/features/onboarding-contact";
import { PrivacyPage } from "@/features/onboarding-privacy";
import { HomePage } from "@/features/onboarding-home";
import { PlatformPage } from "@/features/onboarding-platform";
import { PricingPage } from "@/features/onboarding-pricing";
import { SHOW_PRICING_PAGE } from "@/shared/constants/marketingFeatures";
import { QUOTATION_URL } from "@/shared/constants/marketingLinks";
import { TenantSignupPage } from "@/features/tenant-discovery";
import { Navigate, Route } from "react-router-dom";
import OnboardingShell from "../components/OnboardingShell";

export function getOnboardingRouteEntries() {
  return (
    <>
      <Route path="*" element={<OnboardingShell />}>
        <Route index element={<HomePage />} />
        <Route path="platform" element={<PlatformPage />} />
        <Route path="services" element={<Navigate to="/platform" replace />} />
        <Route
          path="pricing"
          element={SHOW_PRICING_PAGE ? <PricingPage /> : <Navigate to={QUOTATION_URL} replace />}
        />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="tenant-signup" element={<TenantSignupPage />} />
      </Route>
    </>
  );
}
