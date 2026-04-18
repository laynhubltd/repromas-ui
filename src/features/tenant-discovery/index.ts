export { useCreateTenantMutation } from "./api/tenant-signup-api";
export { useValidateTenantQuery } from "./api/tenant-validation-api";
export { default as TenantSignupPage } from "./components/TenantSignupPage";
export { useTenantSignup } from "./hooks/useTenantSignup";
export type { BrandConfigValue, TenantSignupRequest, TenantSignupResponse, TenantStatus, TenantValidationResponse } from "./types";
export {
    buildTenantLoginUrl,
    isMatchingTenantSlug,
    isTenantActive,
    readApiErrorMessage
} from "./utils";
export { suggestSlug } from "./utils/suggestSlug";
export { codeRules, emailRules, nameRules, primaryColorRules, slugRules } from "./utils/validators";

