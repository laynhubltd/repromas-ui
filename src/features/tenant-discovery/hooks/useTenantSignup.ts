import { useGetStatesQuery } from "@/features/admission-config/tabs/geography-rule/api/statesApi";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notification } from "antd";
import type { FormInstance } from "antd/es/form";
import Form from "antd/es/form";
import { useMemo, useState } from "react";
import { useCreateTenantMutation } from "../api/tenant-signup-api";
import type { TenantSignupFormValues, TenantSignupResponse } from "../types";
import { buildTenantLoginUrl } from "../utils";
import { buildSignupFormData } from "../utils/build-signup-form-data";
import { getFirstStepWithError } from "../utils/field-steps";
import { suggestSlug } from "../utils/suggestSlug";

const STEP_VALIDATION_FIELDS = {
  0: ["name", "code", "slug", "institutionType", "email", "customDomain"],
  1: ["primaryColor", "tagline", "motto", "logoUrl"],
  2: [
    "fullAddress",
    "stateId",
    "postalCode",
    "phone",
    "contactEmail",
    "facebook",
    "twitter",
    "linkedin",
    "youtube",
  ],
} as const;

export type UseTenantSignupReturn = {
  state: {
    currentStep: number;
    isSubmitting: boolean;
    isCompleted: boolean;
    formError: string | null;
    slugPreviewUrl: string;
    logoMode: "upload" | "url";
    logoFile: File | null;
    createdResponse: TenantSignupResponse | null;
    states: { id: number; name: string; code: string; countryCode: string }[];
    isStatesLoading: boolean;
    isNigerianState: boolean;
  };
  actions: {
    handleNext: () => Promise<void>;
    handleBack: () => void;
    handleSubmit: () => Promise<void>;
    handleNameChange: (name: string) => void;
    handleCodeChange: (code: string) => void;
    handleSlugManualEdit: () => void;
    setLogoMode: (mode: "upload" | "url") => void;
    setLogoFile: (file: File | null) => void;
    resetForm: () => void;
  };
  form: FormInstance<TenantSignupFormValues>;
};

export function useTenantSignup(): UseTenantSignupReturn {
  const handleApiError = useApiError();
  const [form] = Form.useForm<TenantSignupFormValues>();

  const [currentStep, setCurrentStep] = useState(0);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdResponse, setCreatedResponse] = useState<TenantSignupResponse | null>(null);

  const [logoMode, setLogoMode] = useState<"upload" | "url">("upload");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [createTenant] = useCreateTenantMutation();

  // Fetch reference states list (public read-only endpoint)
  const { data: statesResponse, isLoading: isStatesLoading } = useGetStatesQuery({
    itemsPerPage: 50,
    sort: "name",
  });
  const states = useMemo(() => statesResponse?.member ?? [], [statesResponse]);

  // Watch fields for real-time reactivity
  const watchedSlug = Form.useWatch("slug", form) ?? "";
  const watchedStateId = Form.useWatch("stateId", form);

  const selectedState = useMemo(
    () => states.find((s) => s.id === watchedStateId),
    [states, watchedStateId],
  );

  const isNigerianState = useMemo(() => {
    if (!selectedState) return true; // Default to Nigeria rules if not selected yet
    const code = selectedState.countryCode?.toUpperCase();
    return code === "NGA" || code === "NG";
  }, [selectedState]);

  const slugPreviewUrl = watchedSlug ? buildTenantLoginUrl(watchedSlug) : "";

  // ─── Field Auto-suggest / Formatting ──────────────────────────────────────

  function handleNameChange(name: string): void {
    if (!slugTouched) {
      form.setFieldValue("slug", suggestSlug(name));
    }
  }

  function handleCodeChange(code: string): void {
    form.setFieldValue("code", code.toUpperCase().replace(/[^A-Z0-9]/g, ""));
  }

  function handleSlugManualEdit(): void {
    setSlugTouched(true);
  }

  // ─── Step Navigation ──────────────────────────────────────────────────────

  async function handleNext(): Promise<void> {
    const fields = STEP_VALIDATION_FIELDS[currentStep as 0 | 1];
    if (fields) {
      await form.validateFields(fields as unknown as (keyof TenantSignupFormValues)[]);
    }
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  }

  function handleBack(): void {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  function resetForm(): void {
    form.resetFields();
    setLogoFile(null);
    setLogoMode("upload");
    setCurrentStep(0);
    setCreatedResponse(null);
    setFormError(null);
    setSlugTouched(false);
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(): Promise<void> {
    // Validate final step before submission
    await form.validateFields(
      STEP_VALIDATION_FIELDS[2] as unknown as (keyof TenantSignupFormValues)[],
    );

    const values = form.getFieldsValue(true) as TenantSignupFormValues;
    const formData = buildSignupFormData(values, logoFile);

    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await createTenant(formData).unwrap();

      setCreatedResponse(response);
      localStorage.setItem("tenant_slug", response.tenant.slug);

      notification.success({
        message: `${response.tenant.name} workspace created!`,
        description: `Workspace is ready at ${response.tenant.slug}.repromas.app. Check ${response.tenant.email} to set your password.`,
        duration: 8,
      });
    } catch (err: unknown) {
      const maybeError = err as { status?: number; data?: { status?: number; detail?: string } };
      const status = maybeError?.status || maybeError?.data?.status;

      if (status === 429) {
        setFormError(
          "Too many signup attempts from your connection. Please wait an hour before trying again, or contact support.",
        );
        return;
      }

      const decision = handleApiError(err, {
        context: { screen: RequestScreen.Form, method: "POST" },
        form,
        setFormError,
      });

      // Jump to the earliest step containing an error
      const errorFields = Object.keys(decision.fieldErrors);
      const targetStep = getFirstStepWithError(errorFields);
      if (targetStep !== null) {
        setCurrentStep(targetStep);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    state: {
      currentStep,
      isSubmitting,
      isCompleted: createdResponse !== null,
      formError,
      slugPreviewUrl,
      logoMode,
      logoFile,
      createdResponse,
      states,
      isStatesLoading,
      isNigerianState,
    },
    actions: {
      handleNext,
      handleBack,
      handleSubmit,
      handleNameChange,
      handleCodeChange,
      handleSlugManualEdit,
      setLogoMode,
      setLogoFile,
      resetForm,
    },
    form,
  };
}
