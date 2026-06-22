import { useUploadDocumentMutation } from "@/features/dynamic-form/api/documentUploadApi";
import {
  FileUploadFieldActionType,
  fileUploadFieldReducer,
  initialFileUploadFieldState,
} from "@/features/dynamic-form/state/fileUploadFieldState";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { useToken } from "@/shared/hooks/useToken";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PaperClipOutlined,
  UploadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Flex, Spin, Tag, Typography, Upload } from "antd";
import { useCallback, useEffect, useReducer, useRef } from "react";
import type { RenderField } from "../../types";

// ─── Client-side validation ───────────────────────────────────────────────────

function validateFile(
  file: File,
  mimeTypes: string[],
  maxSizeMb: number,
): string | null {
  if (mimeTypes.length > 0 && !mimeTypes.includes(file.type)) {
    return `File type "${file.type}" is not accepted. Allowed: ${mimeTypes.join(", ")}.`;
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    return `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — maximum is ${maxSizeMb} MB.`;
  }
  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

type FileUploadFieldProps = {
  field: RenderField;
  /** Current value in the form — the integer uploadId, or null when not yet uploaded */
  value: number | null;
  onChange: (uploadId: number | null) => void;
  disabled?: boolean;
  /** Candidate entity ID — required for the upload endpoint */
  candidateId?: number;
  /** Actor type — defaults to "CANDIDATE" */
  actorType?: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function FileUploadField({
  field,
  value,
  onChange,
  disabled,
  candidateId,
  actorType = "CANDIDATE",
}: FileUploadFieldProps) {
  const token = useToken();
  const handleApiError = useApiError();
  const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();

  const [state, dispatch] = useReducer(
    fileUploadFieldReducer,
    initialFileUploadFieldState,
  );

  // Resolve document type meta from field.options[0].meta
  const documentTypeId =
    typeof field.options?.[0]?.value === "number"
      ? field.options[0].value
      : null;
  const mimeTypes: string[] = field.options?.[0]?.meta?.mimeTypes ?? [];
  const maxSizeMb: number = field.options?.[0]?.meta?.maxSizeMb ?? 10;
  const accept = mimeTypes.length > 0 ? mimeTypes.join(",") : "*/*";

  // Hydrate from prefill on first render
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (!field.options || field.options.length === 0) {
      dispatch({ type: FileUploadFieldActionType.SetUnavailable });
      return;
    }

    const prefill = field.prefill;
    if (prefill) {
      dispatch({
        type: FileUploadFieldActionType.SetUploaded,
        uploadId: prefill.uploadId,
        filename: prefill.originalFilename,
        serverStatus: prefill.status,
      });
      if (value == null) {
        onChange(prefill.uploadId);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // beforeUpload intercepts the file before AntD tries to upload it.
  // Return false to prevent AntD's own upload — we handle it manually,
  // exactly like useCourseBulkUpload / useStudentBulkUpload do.
  const handleBeforeUpload = useCallback(
    async (file: File): Promise<false> => {
      // Client-side validation
      const validationError = validateFile(file, mimeTypes, maxSizeMb);
      if (validationError) {
        dispatch({
          type: FileUploadFieldActionType.SetError,
          message: validationError,
        });
        return false;
      }

      if (documentTypeId == null || candidateId == null) {
        const msg =
          candidateId == null
            ? "Candidate ID is not available. Cannot upload file."
            : "Document type is not configured for this field.";
        dispatch({ type: FileUploadFieldActionType.SetError, message: msg });
        return false;
      }

      dispatch({ type: FileUploadFieldActionType.SetUploading });

      try {
        // Build FormData the same way every other upload in this project does
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentTypeId", String(documentTypeId));
        formData.append("actorType", actorType);
        formData.append("actorId", String(candidateId));

        const result = await uploadDocument(formData).unwrap();

        dispatch({
          type: FileUploadFieldActionType.SetUploaded,
          uploadId: result.id,
          filename: result.originalFilename,
          serverStatus: result.status,
        });

        onChange(result.id);
      } catch (err: unknown) {
        dispatch({
          type: FileUploadFieldActionType.SetError,
          message: "Upload failed. Please try again.",
        });
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }

      return false; // always return false — never let AntD upload
    },
    [
      mimeTypes,
      maxSizeMb,
      documentTypeId,
      candidateId,
      actorType,
      uploadDocument,
      onChange,
      handleApiError,
    ],
  );

  const handleReplace = () => {
    dispatch({ type: FileUploadFieldActionType.Reset });
    onChange(null);
  };

  // ─── Unavailable ─────────────────────────────────────────────────────────
  if (state.widgetStatus === "UNAVAILABLE") {
    return (
      <Flex
        align="center"
        gap={8}
        style={{
          padding: "10px 14px",
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          background: token.colorBgContainer,
        }}
      >
        <WarningOutlined style={{ color: token.colorError }} />
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          This upload is currently unavailable. Please contact admissions.
        </Typography.Text>
      </Flex>
    );
  }

  // ─── Uploaded / prefill ───────────────────────────────────────────────────
  if (state.widgetStatus === "UPLOADED" && state.filename) {
    const isVerified = state.serverStatus === "VERIFIED";
    const isRejected = state.serverStatus === "REJECTED";

    return (
      <Flex
        vertical
        gap={6}
        style={{
          padding: "10px 14px",
          border: `1px solid ${isRejected ? token.colorError : token.colorBorder}`,
          borderRadius: token.borderRadius,
          background: token.colorBgContainer,
        }}
      >
        <Flex justify="space-between" align="center" gap={8}>
          <Flex align="center" gap={8} style={{ minWidth: 0 }}>
            {isVerified && (
              <CheckCircleOutlined style={{ color: token.colorPrimary, flexShrink: 0 }} />
            )}
            {isRejected && (
              <CloseCircleOutlined style={{ color: token.colorError, flexShrink: 0 }} />
            )}
            {!isVerified && !isRejected && (
              <PaperClipOutlined style={{ color: token.colorTextSecondary, flexShrink: 0 }} />
            )}
            <Typography.Text ellipsis style={{ fontSize: token.fontSizeSM }}>
              {state.filename}
            </Typography.Text>
          </Flex>
          <Flex align="center" gap={6} style={{ flexShrink: 0 }}>
            {state.serverStatus === "PENDING" && (
              <Tag color="processing" style={{ margin: 0 }}>Pending review</Tag>
            )}
            {isVerified && (
              <Tag color="success" style={{ margin: 0 }}>Verified</Tag>
            )}
            {isRejected && (
              <Tag color="error" style={{ margin: 0 }}>Rejected</Tag>
            )}
            {!isVerified && !disabled && (
              <Button size="small" onClick={handleReplace}>Replace</Button>
            )}
          </Flex>
        </Flex>
        {isRejected && state.rejectionReason && (
          <Typography.Text type="danger" style={{ fontSize: token.fontSizeSM }}>
            Reason: {state.rejectionReason}
          </Typography.Text>
        )}
        {state.error && (
          <Typography.Text type="danger" style={{ fontSize: token.fontSizeSM }}>
            {state.error}
          </Typography.Text>
        )}
      </Flex>
    );
  }

  // ─── IDLE / UPLOADING ─────────────────────────────────────────────────────
  return (
    <Flex vertical gap={4}>
      <Upload
        accept={accept}
        multiple={false}
        showUploadList={false}
        disabled={disabled || isUploading}
        beforeUpload={handleBeforeUpload}
      >
        <Button
          icon={isUploading ? <Spin indicator={<LoadingOutlined />} /> : <UploadOutlined />}
          disabled={disabled || isUploading}
          style={{ width: "100%" }}
        >
          {isUploading ? "Uploading…" : "Choose file"}
        </Button>
      </Upload>
      {mimeTypes.length > 0 || maxSizeMb > 0 ? (
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {mimeTypes.length > 0 && `Accepted: ${mimeTypes.join(", ")}`}
          {mimeTypes.length > 0 && maxSizeMb > 0 && " · "}
          {maxSizeMb > 0 && `Max ${maxSizeMb} MB`}
        </Typography.Text>
      ) : null}
      {state.error && (
        <Typography.Text type="danger" style={{ fontSize: token.fontSizeSM }}>
          {state.error}
        </Typography.Text>
      )}
    </Flex>
  );
}
