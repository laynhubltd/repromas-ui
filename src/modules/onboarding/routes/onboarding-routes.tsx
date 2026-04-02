import { OnboardingShell } from "@/modules/onboarding/components";
import {
  AboutPage,
  ContactPage,
  HomePage,
  ServicesPage,
  TenantSignupPage,
} from "@/modules/onboarding/features";
import { Route } from "react-router-dom";

export function getOnboardingRouteEntries() {
  return (
    <>
      <Route path="" element={<OnboardingShell />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="tenant-signup" element={<TenantSignupPage />} />
      </Route>
    </>
  );
}
