export {
    TenantSignupPage, isMatchingTenantSlug,
    isTenantActive,
    useValidateTenantQuery
} from "@/features/tenant-discovery";
export type { TenantStatus, TenantValidationResponse } from "@/features/tenant-discovery";
export { default as OnboardingShell } from "./components/OnboardingShell";
export { getOnboardingRouteEntries } from "./routes/onboarding-routes";

