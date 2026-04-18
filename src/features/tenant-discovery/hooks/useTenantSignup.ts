import { HttpStatusCode, parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import type { FormInstance } from "antd/es/form";
import Form from "antd/es/form";
import { useState } from "react";
import { useCreateTenantMutation } from "../api/tenant-signup-api";
import type { TenantSignupRequest } from "../types";
import { buildTenantLoginUrl } from "../utils";
import { suggestSlug } from "../utils/suggestSlug";

// ─── Types ────────────────────────────────────────────────────────────────────

type UseTenantSignupReturn = {
  state: {
    currentStep: number;
    isSubmitting: boolean;
    isRedirecting: boolean;
    formError: string | null;
    slugPreviewUrl: string;
  };
  actions: {
    handleNext: () => Promise<void>;
    handleBack: () => void;
    handleSubmit: () => Promise<void>;
    handleNameChange: (name: string) => void;
    handleSlugManualEdit: () => void;
  };
  form: FormInstance;
};

// ─── Step 1 field names (used for error routing) ──────────────────────────────

const STEP1_FIELDS = ["name", "code", "slug", "email", "customDomain"] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTenantSignup(): UseTenantSignupReturn {
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [createTenant] = useCreateTenantMutation();

  // Derive slug preview URL in real-time from watched slug field value
  const watchedSlug: string = Form.useWatch("slug", form) ?? "";
  const slugPreviewUrl = watchedSlug ? buildTenantLoginUrl(watchedSlug) : "";

  // ─── Slug auto-suggest ──────────────────────────────────────────────────────

  function handleNameChange(name: string): void {
    if (!slugTouched) {
      form.setFieldValue("slug", suggestSlug(name));
    }
  }

  function handleSlugManualEdit(): void {
    setSlugTouched(true);
  }

  // ─── Step navigation ────────────────────────────────────────────────────────

  async function handleNext(): Promise<void> {
    await form.validateFields(["name", "code", "slug", "email", "customDomain"]);
    setCurrentStep(1);
  }

  function handleBack(): void {
    setCurrentStep(0);
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(): Promise<void> {
    await form.validateFields(["primaryColor"]);

    const values = form.getFieldsValue(true) as {
      name: string;
      code: string;
      slug: string;
      primaryColor: string;
      email?: string;
      customDomain?: string;
      logoUrl?: string;
      tagline?: string;
      address?: string;
      phone?: string;
    };

    const metadata =
      values.address || values.phone
        ? {
            address: values.address || undefined,
            phone: values.phone || undefined,
          }
        : null;

    const payload: TenantSignupRequest = {
      name: values.name,
      code: values.code,
      slug: values.slug,
      primaryColor: values.primaryColor,
      email: values.email || null,
      customDomain: values.customDomain || null,
      logoUrl: values.logoUrl || null,
      tagline: values.tagline || null,
      ...(metadata !== null ? { metadata } : {}),
    };

    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await createTenant(payload).unwrap();

      // ─── Success redirect flow ──────────────────────────────────────────────
      const email = response.tenant.email;
      notification.success({
        message: `${response.tenant.name} created successfully.`,
        description: email
          ? `A setup email has been sent to ${email}.`
          : undefined,
      });

      setIsRedirecting(true);
      localStorage.setItem("tenant_slug", response.tenant.slug);
      window.location.assign(buildTenantLoginUrl(response.tenant.slug));
    } catch (err) {
      // ─── Server-side error handling ─────────────────────────────────────────
      const parsed = parseApiError(err);

      notification.error({ message: parsed.message });

      if (parsed.status === HttpStatusCode.UnprocessableEntity) {
        // 422 — map violations[].propertyPath → field errors
        const fieldEntries = Object.entries(parsed.fieldErrors);
        if (fieldEntries.length > 0) {
          form.setFields(
            fieldEntries.map(([name, message]) => ({ name, errors: [message] })),
          );
          const hasStep1Error = fieldEntries.some(([name]) =>
            (STEP1_FIELDS as readonly string[]).includes(name),
          );
          if (hasStep1Error) setCurrentStep(0);
        }
      } else if (parsed.status === HttpStatusCode.Conflict) {
        // 409 — map errors[].field → field errors
        const fieldEntries = Object.entries(parsed.fieldErrors);
        if (fieldEntries.length > 0) {
          form.setFields(
            fieldEntries.map(([name, message]) => ({ name, errors: [message] })),
          );
          const hasStep1Error = fieldEntries.some(([name]) =>
            (STEP1_FIELDS as readonly string[]).includes(name),
          );
          if (hasStep1Error) setCurrentStep(0);
        }
      } else if (parsed.status === HttpStatusCode.BadRequest) {
        // 400 — form-level banner error
        setFormError(parsed.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    state: { currentStep, isSubmitting, isRedirecting, formError, slugPreviewUrl },
    actions: { handleNext, handleBack, handleSubmit, handleNameChange, handleSlugManualEdit },
    form,
  };
}
