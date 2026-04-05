import { AboutPage } from "@/features/onboarding-about";
import { ContactPage } from "@/features/onboarding-contact";
import { HomePage } from "@/features/onboarding-home";
import { ServicesPage } from "@/features/onboarding-services";
import { TenantSignupPage } from "@/features/tenant-discovery";
import { Route } from "react-router-dom";
import OnboardingShell from "../components/OnboardingShell";

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
