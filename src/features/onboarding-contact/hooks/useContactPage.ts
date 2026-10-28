import { Form } from "antd";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { CONTACT_EMAIL, WHATSAPP_URL } from "@/shared/constants/marketingLinks";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { useSubmitContactRequestMutation } from "../api/contact-api";
import { ContactFormActionType, contactFormReducer, initialContactFormState } from "../state/contactFormState";
import type { ContactChannel, ContactFormValues, ContactRequestPayload } from "../types";
import {
  CONTACT_DIRECT_HEADING,
  CONTACT_FORM_COPY,
  CONTACT_HERO,
  CONTACT_NEXT_STEPS,
  CONTACT_NEXT_STEPS_HEADING,
  CONTACT_SEO,
  CONTACT_SUCCESS_COPY,
} from "../utils/contact-content";
import {
  CONTACT_INSTITUTION_TYPE_OPTIONS,
  CONTACT_ROLE_OPTIONS,
  CONTACT_STUDENT_POPULATION_OPTIONS,
  CONTACT_TOPIC_OPTIONS,
  parseContactTopic,
} from "../utils/contact-options";

const blankToNull = (value?: string): string | null => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
};

/**
 * Contact page: the request form, its success state and the reassurance panel.
 *
 * `?topic=pricing` (from quotation links, and /pricing while that page is hidden) pre-selects the topic; the page path and query are sent as `sourcePage`
 * so the team can see where the visitor came from.
 */
export function useContactPage() {
  const [form] = Form.useForm<ContactFormValues>();
  const [state, dispatch] = useReducer(contactFormReducer, initialContactFormState);
  const [submitContactRequest, { isLoading }] = useSubmitContactRequestMutation();
  const handleApiError = useApiError();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const successRef = useRef<HTMLDivElement>(null);

  const initialValues = useMemo<Partial<ContactFormValues>>(
    () => ({ topic: parseContactTopic(searchParams.get("topic")) }),
    [searchParams],
  );
  const topic = Form.useWatch("topic", form) ?? initialValues.topic;
  const isSuccess = state.phase === "success";

  // Move focus to the confirmation so screen readers announce it and keyboard users land on it.
  useEffect(() => {
    if (isSuccess) {
      successRef.current?.focus();
    }
  }, [isSuccess]);

  const handleSubmit = useCallback(
    async (values: ContactFormValues) => {
      const payload: ContactRequestPayload = {
        topic: values.topic,
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: blankToNull(values.phone),
        institution: values.institution.trim(),
        institutionType: values.institutionType ?? null,
        role: values.role ?? null,
        studentPopulation: values.studentPopulation ?? null,
        message: blankToNull(values.message),
        sourcePage: `${location.pathname}${location.search}`,
        website: blankToNull(values.website),
      };

      try {
        const receipt = await submitContactRequest(payload).unwrap();
        dispatch({ type: ContactFormActionType.SetSuccess, receipt, name: payload.fullName.split(" ")[0] });
      } catch (err: unknown) {
        handleApiError(err, { context: { screen: RequestScreen.Form, method: "POST" }, form });
      }
    },
    [form, handleApiError, location.pathname, location.search, submitContactRequest],
  );

  // Fields are first checked on blur; once a field shows an error it re-checks as the visitor types, so the
  // message disappears as soon as it is fixed.
  const handleValuesChange = useCallback(
    (changed: Partial<ContactFormValues>) => {
      const fieldsWithErrors = (Object.keys(changed) as (keyof ContactFormValues)[]).filter(
        (name) => form.getFieldError(name).length > 0,
      );
      if (fieldsWithErrors.length > 0) {
        form.validateFields(fieldsWithErrors).catch(() => undefined);
      }
    },
    [form],
  );

  const handleSendAnother = useCallback(() => {
    dispatch({ type: ContactFormActionType.Reset });
    form.resetFields();
  }, [form]);

  const channels = useMemo<ContactChannel[]>(
    () => [
      { label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
      ...(WHATSAPP_URL ? [{ label: "WhatsApp", value: "Chat with the team", href: WHATSAPP_URL }] : []),
    ],
    [],
  );

  return {
    seo: CONTACT_SEO,
    content: {
      hero: CONTACT_HERO,
      nextStepsHeading: CONTACT_NEXT_STEPS_HEADING,
      nextSteps: CONTACT_NEXT_STEPS,
      directHeading: CONTACT_DIRECT_HEADING,
      channels,
      formCopy: CONTACT_FORM_COPY,
      successCopy: CONTACT_SUCCESS_COPY,
      options: {
        topics: CONTACT_TOPIC_OPTIONS,
        institutionTypes: CONTACT_INSTITUTION_TYPE_OPTIONS,
        roles: CONTACT_ROLE_OPTIONS,
        studentPopulations: CONTACT_STUDENT_POPULATION_OPTIONS,
      },
    },
    state: {
      form,
      initialValues,
      submitLabel: topic === "demo" ? CONTACT_FORM_COPY.submitDemo : CONTACT_FORM_COPY.submitOther,
      receipt: state.receipt,
      submittedName: state.submittedName,
      successRef,
      whatsappUrl: WHATSAPP_URL,
    },
    actions: {
      handleSubmit,
      handleValuesChange,
      handleSendAnother,
    },
    flags: {
      isSubmitting: isLoading,
      isSuccess,
      hasWhatsapp: WHATSAPP_URL !== null,
    },
  };
}
