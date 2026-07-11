import type { BrandingConfigValue } from "../types/branding-config";

export const DEFAULT_PRIMARY_COLOR = "#1E40AF";

export const BrandingConfigActionType = {
  SetPrimaryColor: "SET_PRIMARY_COLOR",
  SetTagline: "SET_TAGLINE",
  SetLogoUrl: "SET_LOGO_URL",
  SetMotto: "SET_MOTTO",
  SetFullAddress: "SET_FULL_ADDRESS",
  SetStateId: "SET_STATE_ID",
  SetPostalCode: "SET_POSTAL_CODE",
  SetPhone: "SET_PHONE",
  SetEmail: "SET_EMAIL",
  SetFacebook: "SET_FACEBOOK",
  SetTwitter: "SET_TWITTER",
  SetLinkedin: "SET_LINKEDIN",
  SetYoutube: "SET_YOUTUBE",
  SyncFromConfig: "SYNC_FROM_CONFIG",
  ResetToDefaults: "RESET_TO_DEFAULTS",
} as const;

export type BrandingConfigFormState = {
  primaryColor: string;
  tagline: string;
  logoUrl: string | null;
  motto: string;
  fullAddress: string;
  stateId: number | null;
  postalCode: string;
  phone: string;
  email: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  youtube: string;
};

export type BrandingConfigFormAction =
  | { type: typeof BrandingConfigActionType.SetPrimaryColor; value: string }
  | { type: typeof BrandingConfigActionType.SetTagline; value: string }
  | { type: typeof BrandingConfigActionType.SetLogoUrl; value: string | null }
  | { type: typeof BrandingConfigActionType.SetMotto; value: string }
  | { type: typeof BrandingConfigActionType.SetFullAddress; value: string }
  | { type: typeof BrandingConfigActionType.SetStateId; value: number | null }
  | { type: typeof BrandingConfigActionType.SetPostalCode; value: string }
  | { type: typeof BrandingConfigActionType.SetPhone; value: string }
  | { type: typeof BrandingConfigActionType.SetEmail; value: string }
  | { type: typeof BrandingConfigActionType.SetFacebook; value: string }
  | { type: typeof BrandingConfigActionType.SetTwitter; value: string }
  | { type: typeof BrandingConfigActionType.SetLinkedin; value: string }
  | { type: typeof BrandingConfigActionType.SetYoutube; value: string }
  | {
      type: typeof BrandingConfigActionType.SyncFromConfig;
      value: BrandingConfigValue;
    }
  | { type: typeof BrandingConfigActionType.ResetToDefaults };

export const initialBrandingConfigFormState: BrandingConfigFormState = {
  primaryColor: DEFAULT_PRIMARY_COLOR,
  tagline: "",
  logoUrl: null,
  motto: "",
  fullAddress: "",
  stateId: null,
  postalCode: "",
  phone: "",
  email: "",
  facebook: "",
  twitter: "",
  linkedin: "",
  youtube: "",
};

export function brandingConfigFormReducer(
  state: BrandingConfigFormState,
  action: BrandingConfigFormAction,
): BrandingConfigFormState {
  switch (action.type) {
    case BrandingConfigActionType.SetPrimaryColor:
      return { ...state, primaryColor: action.value };
    case BrandingConfigActionType.SetTagline:
      return { ...state, tagline: action.value };
    case BrandingConfigActionType.SetLogoUrl:
      return { ...state, logoUrl: action.value };
    case BrandingConfigActionType.SetMotto:
      return { ...state, motto: action.value };
    case BrandingConfigActionType.SetFullAddress:
      return { ...state, fullAddress: action.value };
    case BrandingConfigActionType.SetStateId:
      return { ...state, stateId: action.value };
    case BrandingConfigActionType.SetPostalCode:
      return { ...state, postalCode: action.value };
    case BrandingConfigActionType.SetPhone:
      return { ...state, phone: action.value };
    case BrandingConfigActionType.SetEmail:
      return { ...state, email: action.value };
    case BrandingConfigActionType.SetFacebook:
      return { ...state, facebook: action.value };
    case BrandingConfigActionType.SetTwitter:
      return { ...state, twitter: action.value };
    case BrandingConfigActionType.SetLinkedin:
      return { ...state, linkedin: action.value };
    case BrandingConfigActionType.SetYoutube:
      return { ...state, youtube: action.value };
    case BrandingConfigActionType.SyncFromConfig:
      return {
        primaryColor: action.value.primaryColor,
        tagline: action.value.tagline ?? "",
        logoUrl: action.value.logoUrl,
        motto: action.value.motto ?? "",
        fullAddress: action.value.fullAddress ?? "",
        stateId: action.value.state?.id ?? null,
        postalCode: action.value.postalCode ?? "",
        phone: action.value.phone ?? "",
        email: action.value.email ?? "",
        facebook: action.value.facebook ?? "",
        twitter: action.value.twitter ?? "",
        linkedin: action.value.linkedin ?? "",
        youtube: action.value.youtube ?? "",
      };
    case BrandingConfigActionType.ResetToDefaults:
      return initialBrandingConfigFormState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
