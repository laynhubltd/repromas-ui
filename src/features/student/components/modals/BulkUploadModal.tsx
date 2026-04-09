// Feature: student-bulk-upload
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { DownloadOutlined, InboxOutlined } from "@ant-design/icons";
import { Button, Modal, Typography } from "antd";
import { useRef } from "react";

export type BulkUploadModalProps = {
  open: boolean;
  onClose: () => void;
  selectedFile: File | null;
  isUploading: boolean;
  uploadError: string | null;
  hasFile: boolean;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
  onDownloadTemplate: () => void;
};

export function BulkUploadModal({
  open,
  onClose,
  selectedFile,
  isUploading,
  uploadError,
  hasFile,
  onFileChange,
  onUpload,
  onDownloadTemplate,
}: BulkUploadModalProps) {
  const token = useToken();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
    // Reset input so the same file can be re-selected after clearing
    e.target.value = "";
  }

  return (
    <Modal
      title="Upload Multiple Students"
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnHidden
      closable
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
        {/* Instructions panel */}
        <div
          style={{
            background: token.colorBgLayout,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadius,
            padding: `${token.paddingSM}px ${token.sizeMD}px`,
            marginBottom: token.sizeMD,
          }}
        >
          <Typography.Text
            strong
            style={{ display: "block", marginBottom: token.sizeXS, color: token.colorText }}
          >
            How to upload students
          </Typography.Text>
          <ol
            style={{
              margin: 0,
              paddingLeft: token.sizeMD,
              color: token.colorTextSecondary,
              fontSize: token.fontSizeSM,
              lineHeight: 1.8,
            }}
          >
            <li>
              Download the template using the{" "}
              <Typography.Link onClick={onDownloadTemplate} style={{ fontSize: token.fontSizeSM }}>
                <DownloadOutlined /> Download Template
              </Typography.Link>{" "}
              button.
            </li>
            <li>Fill in student data starting from row 5 using the provided dropdowns.</li>
            <li>
              Do <strong>not</strong> modify the <em>Reference</em> sheet.
            </li>
            <li>Save the file before uploading.</li>
          </ol>
        </div>

        {/* File input area */}
        <div
          style={{
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            padding: `${token.sizeLG}px ${token.sizeMD}px`,
            textAlign: "center",
            cursor: "pointer",
            marginBottom: token.sizeSM,
            background: token.colorBgContainer,
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <InboxOutlined
            style={{ fontSize: 32, color: token.colorPrimary, display: "block", marginBottom: 8 }}
          />
          <Typography.Text style={{ color: token.colorTextSecondary, fontSize: token.fontSizeSM }}>
            Click to select an <strong>.xlsx</strong> file
          </Typography.Text>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />
        </div>

        {/* Selected filename */}
        <ConditionalRenderer when={hasFile}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: token.sizeXS,
              padding: `${token.sizeXS}px ${token.sizeSM}px`,
              background: token.colorBgLayout,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadius,
              marginBottom: token.sizeSM,
            }}
          >
            <Typography.Text
              style={{ fontSize: token.fontSizeSM, color: token.colorText, flex: 1 }}
              ellipsis
            >
              {selectedFile?.name}
            </Typography.Text>
            <Button
              type="text"
              size="small"
              danger
              onClick={() => onFileChange(null)}
              style={{ fontSize: token.fontSizeSM }}
            >
              Remove
            </Button>
          </div>
        </ConditionalRenderer>

        {/* Upload error */}
        <ConditionalRenderer when={uploadError !== null}>
          <ErrorAlert error={uploadError} />
        </ConditionalRenderer>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <DataLoader loading={isUploading}>
          <Button
            type="primary"
            disabled={!hasFile || isUploading}
            onClick={onUpload}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Upload
          </Button>
        </DataLoader>
        <Button
          type="text"
          block
          onClick={onClose}
          disabled={isUploading}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
