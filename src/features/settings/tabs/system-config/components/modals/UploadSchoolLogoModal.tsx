import {
  useGetBrandingConfigQuery,
  useUploadBrandingConfigLogoMutation,
} from "../../api/brandingConfigApi";
import type { BrandingConfig } from "../../types/branding-config";
import {
  BRANDING_LOGO_CROP_ASPECT,
  BRANDING_LOGO_MAX_SIZE_MB,
  BRANDING_LOGO_OUTPUT_HEIGHT,
  BRANDING_LOGO_OUTPUT_WIDTH,
} from "../../types/branding-config";
import type { useBrandingConfig } from "../../hooks/useBrandingConfig";
import { useApiError } from "@/shared/hooks/useApiError";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { PictureUploader } from "@/shared/ui/PictureUploader";
import type { UploadMutationHookResponse } from "@/shared/types/pictureUploader";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { Alert, Modal } from "antd";
import { useCallback } from "react";

type BrandingConfigController = ReturnType<typeof useBrandingConfig>;

function useBrandingLogoQuery() {
  return useGetBrandingConfigQuery();
}

function useBrandingLogoUploadMutation(): UploadMutationHookResponse<FormData> {
  const [upload, { isLoading, error, isSuccess }] =
    useUploadBrandingConfigLogoMutation();

  return [
    (payload) => upload(payload),
    { isLoading, error, isSuccess },
  ];
}

export type UploadSchoolLogoModalProps = {
  open: boolean;
  onClose: () => void;
  flags: BrandingConfigController["flags"];
  actions: Pick<BrandingConfigController["actions"], "refetch">;
};

function getExistingLogoUrl(data: BrandingConfig | undefined): string | null {
  return data?.configValue?.logoUrl?.trim() || null;
}

function buildLogoUploadFormData(file: File): FormData {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

export function UploadSchoolLogoModal({
  open,
  onClose,
  flags,
  actions,
}: UploadSchoolLogoModalProps) {
  const token = useToken();
  const handleApiError = useApiError();

  const handleUploadSuccess = useCallback(() => {
    notifyMutationSuccess("Logo uploaded successfully.");
    void actions.refetch();
    onClose();
  }, [actions, onClose]);

  const handleUploadError = useCallback(
    (error: unknown) => {
      handleApiError(error, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    },
    [handleApiError],
  );

  return (
    <Modal
      title="Upload School Logo"
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      closable
      destroyOnHidden
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <ConditionalRenderer when={!flags.configExists}>
          <Alert
            type="warning"
            showIcon
            message="Brand config required"
            description="Create a brand config first before uploading a logo. Use Edit to save your school information."
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={flags.configExists}>
          <PictureUploader<BrandingConfig, FormData>
            useGetQuery={useBrandingLogoQuery}
            useUploadMutation={useBrandingLogoUploadMutation}
            getExistingImageUrl={getExistingLogoUrl}
            uploadPayloadFormatter={buildLogoUploadFormData}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            title="School Logo"
            description="Upload your institution logo. JPEG, PNG, GIF, or WebP up to 2 MB. The logo is saved automatically after upload."
            maxSizeMB={BRANDING_LOGO_MAX_SIZE_MB}
            aspectRatio={BRANDING_LOGO_CROP_ASPECT}
            outputWidth={BRANDING_LOGO_OUTPUT_WIDTH}
            outputHeight={BRANDING_LOGO_OUTPUT_HEIGHT}
          />
        </ConditionalRenderer>
      </div>
    </Modal>
  );
}
