import { useGetStatesQuery } from "@/features/admission-config/tabs/geography-rule/api/statesApi";
import { getQueryHttpStatus } from "@/features/student-home/utils/getQueryHttpStatus";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  useCreateBrandingConfigMutation,
  useGetBrandingConfigQuery,
  useUpdateBrandingConfigMutation,
  useUploadBrandingConfigLogoMutation,
} from "../api/brandingConfigApi";
import {
  BrandingConfigActionType,
  brandingConfigFormReducer,
  initialBrandingConfigFormState,
  type BrandingConfigFormState,
} from "../state/brandingConfigFormState";
import type {
  BrandingConfigLogoUploadResponse,
  UpsertBrandingConfigRequest,
} from "../types/branding-config";
import { BRANDING_LOGO_ACCEPT_MIME_TYPES } from "../types/branding-config";
import {
  validateBrandingForm,
  type BrandingFormFieldErrors,
} from "../utils/validators";

function buildUpsertPayload(
  form: BrandingConfigFormState,
): UpsertBrandingConfigRequest | null {
  const primaryColor = form.primaryColor.trim();
  if (!primaryColor) return null;

  return {
    primaryColor,
    logoUrl: form.logoUrl,
    tagline: form.tagline.trim() || null,
    motto: form.motto.trim() || null,
    fullAddress: form.fullAddress.trim() || null,
    stateId: form.stateId,
    postalCode: form.postalCode.trim() || null,
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    facebook: form.facebook.trim() || null,
    twitter: form.twitter.trim() || null,
    linkedin: form.linkedin.trim() || null,
    youtube: form.youtube.trim() || null,
  };
}

const LOGO_ACCEPT_TYPES = BRANDING_LOGO_ACCEPT_MIME_TYPES;

const STATES_QUERY = { itemsPerPage: 200, sort: "name:asc" } as const;

export function useBrandingConfig() {
  const handleApiError = useApiError();
  const [formState, dispatch] = useReducer(
    brandingConfigFormReducer,
    initialBrandingConfigFormState,
  );
  const [fieldErrors, setFieldErrors] = useState<BrandingFormFieldErrors>({});

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetBrandingConfigQuery();

  const { data: statesData, isLoading: isStatesLoading } =
    useGetStatesQuery(STATES_QUERY);

  const [createBrandingConfig, { isLoading: isCreating }] =
    useCreateBrandingConfigMutation();
  const [updateBrandingConfig, { isLoading: isUpdating }] =
    useUpdateBrandingConfigMutation();
  const [uploadBrandingConfigLogo, { isLoading: isUploadingLogo }] =
    useUploadBrandingConfigLogoMutation();

  const queryStatus = getQueryHttpStatus(error);
  const isNotConfigured = isError && queryStatus === 404;
  const configExists = Boolean(data) && !isNotConfigured;

  const stateOptions = useMemo(
    () =>
      (statesData?.member ?? []).map((state) => ({
        value: state.id,
        label: state.name,
      })),
    [statesData?.member],
  );

  const validStateIds = useMemo(
    () => new Set((statesData?.member ?? []).map((state) => state.id)),
    [statesData?.member],
  );

  useEffect(() => {
    if (data?.configValue) {
      dispatch({
        type: BrandingConfigActionType.SyncFromConfig,
        value: data.configValue,
      });
      return;
    }

    if (isNotConfigured) {
      dispatch({ type: BrandingConfigActionType.ResetToDefaults });
    }
  }, [data, isNotConfigured]);

  const sectionError = useMemo(() => {
    if (!isError || isNotConfigured) return null;
    return deriveSectionErrorMessage(isError, error, {
      screen: RequestScreen.List,
      method: "GET",
    });
  }, [isError, isNotConfigured, error]);

  const clearFieldError = useCallback(
    (field: keyof BrandingFormFieldErrors) => {
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const handlePrimaryColorChange = useCallback(
    (value: string) => {
      clearFieldError("primaryColor");
      dispatch({
        type: BrandingConfigActionType.SetPrimaryColor,
        value,
      });
    },
    [clearFieldError],
  );

  const handleTaglineChange = useCallback((value: string) => {
    dispatch({
      type: BrandingConfigActionType.SetTagline,
      value,
    });
  }, []);

  const handleMottoChange = useCallback((value: string) => {
    dispatch({
      type: BrandingConfigActionType.SetMotto,
      value,
    });
  }, []);

  const handleFullAddressChange = useCallback((value: string) => {
    dispatch({
      type: BrandingConfigActionType.SetFullAddress,
      value,
    });
  }, []);

  const handleStateIdChange = useCallback(
    (value: number | null) => {
      clearFieldError("stateId");
      dispatch({
        type: BrandingConfigActionType.SetStateId,
        value,
      });
    },
    [clearFieldError],
  );

  const handlePostalCodeChange = useCallback((value: string) => {
    dispatch({
      type: BrandingConfigActionType.SetPostalCode,
      value,
    });
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    dispatch({
      type: BrandingConfigActionType.SetPhone,
      value,
    });
  }, []);

  const handleEmailChange = useCallback(
    (value: string) => {
      clearFieldError("email");
      dispatch({
        type: BrandingConfigActionType.SetEmail,
        value,
      });
    },
    [clearFieldError],
  );

  const handleFacebookChange = useCallback(
    (value: string) => {
      clearFieldError("facebook");
      dispatch({
        type: BrandingConfigActionType.SetFacebook,
        value,
      });
    },
    [clearFieldError],
  );

  const handleTwitterChange = useCallback(
    (value: string) => {
      clearFieldError("twitter");
      dispatch({
        type: BrandingConfigActionType.SetTwitter,
        value,
      });
    },
    [clearFieldError],
  );

  const handleLinkedinChange = useCallback(
    (value: string) => {
      clearFieldError("linkedin");
      dispatch({
        type: BrandingConfigActionType.SetLinkedin,
        value,
      });
    },
    [clearFieldError],
  );

  const handleYoutubeChange = useCallback(
    (value: string) => {
      clearFieldError("youtube");
      dispatch({
        type: BrandingConfigActionType.SetYoutube,
        value,
      });
    },
    [clearFieldError],
  );

  const persistBrandingConfig = useCallback(
    async (payload: UpsertBrandingConfigRequest, exists: boolean) => {
      if (exists) {
        return updateBrandingConfig(payload).unwrap();
      }

      try {
        return await createBrandingConfig(payload).unwrap();
      } catch (err: unknown) {
        if (getQueryHttpStatus(err) === 409) {
          return updateBrandingConfig(payload).unwrap();
        }
        throw err;
      }
    },
    [createBrandingConfig, updateBrandingConfig],
  );

  const handleSave = useCallback(async (): Promise<boolean> => {
    const validationErrors = validateBrandingForm(formState, validStateIds);
    if (validationErrors) {
      setFieldErrors(validationErrors);
      return false;
    }

    const payload = buildUpsertPayload(formState);
    if (!payload) {
      setFieldErrors({ primaryColor: "Primary color is required." });
      return false;
    }

    const submittedStateId = formState.stateId;

    try {
      await persistBrandingConfig(payload, configExists);
      const refreshed = await refetch();

      if (
        submittedStateId !== null &&
        !refreshed.data?.configValue.state
      ) {
        setFieldErrors({
          stateId:
            "Selected state was not recognised. Please choose again.",
        });
        notifyMutationSuccess(mutationSuccessMessage("Branding", "saved"));
        return false;
      }

      setFieldErrors({});
      notifyMutationSuccess(mutationSuccessMessage("Branding", "saved"));
      return true;
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Action,
          method: configExists ? "PUT" : "POST",
        },
      });
      return false;
    }
  }, [
    formState,
    validStateIds,
    configExists,
    persistBrandingConfig,
    refetch,
    handleApiError,
  ]);

  const handleLogoUpload = useCallback(
    async (file: File) => {
      if (!configExists) {
        handleApiError(
          new Error("Create a brand config before uploading a logo."),
          {
            context: { screen: RequestScreen.Action, method: "POST" },
          },
        );
        return;
      }

      if (
        !LOGO_ACCEPT_TYPES.includes(
          file.type as (typeof LOGO_ACCEPT_TYPES)[number],
        )
      ) {
        handleApiError(
          new Error("Supported formats are JPEG, PNG, GIF, WebP, or SVG."),
          { context: { screen: RequestScreen.Action, method: "POST" } },
        );
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResult: BrandingConfigLogoUploadResponse =
          await uploadBrandingConfigLogo(formData).unwrap();

        dispatch({
          type: BrandingConfigActionType.SetLogoUrl,
          value: uploadResult.logoUrl,
        });

        notifyMutationSuccess("Logo uploaded successfully.");
        refetch();
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    },
    [configExists, uploadBrandingConfigLogo, refetch, handleApiError],
  );

  const isSaving = isCreating || isUpdating;

  return {
    state: {
      primaryColor: formState.primaryColor,
      tagline: formState.tagline,
      logoUrl: formState.logoUrl,
      motto: formState.motto,
      fullAddress: formState.fullAddress,
      stateId: formState.stateId,
      postalCode: formState.postalCode,
      phone: formState.phone,
      email: formState.email,
      facebook: formState.facebook,
      twitter: formState.twitter,
      linkedin: formState.linkedin,
      youtube: formState.youtube,
      schoolName: data?.configValue?.schoolName ?? null,
      tenantName: data?.configValue?.tenantName ?? null,
      resolvedState: data?.configValue?.state ?? null,
      stateOptions,
      fieldErrors,
      updatedAt: data?.updatedAt ?? null,
      isLoading: isLoading || isFetching,
      isStatesLoading,
      isSaving,
      isUploadingLogo,
      sectionError,
    },
    actions: {
      handlePrimaryColorChange,
      handleTaglineChange,
      handleMottoChange,
      handleFullAddressChange,
      handleStateIdChange,
      handlePostalCodeChange,
      handlePhoneChange,
      handleEmailChange,
      handleFacebookChange,
      handleTwitterChange,
      handleLinkedinChange,
      handleYoutubeChange,
      handleSave,
      handleLogoUpload,
      refetch,
    },
    flags: {
      configExists,
      isNotConfigured,
      canUploadLogo: configExists,
      hasLogo: Boolean(formState.logoUrl),
      primaryColorRequired: !formState.primaryColor.trim(),
    },
  };
}
