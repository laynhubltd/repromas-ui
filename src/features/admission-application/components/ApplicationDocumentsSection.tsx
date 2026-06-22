import type { DocumentUpload } from "@/features/dynamic-form/api/documentUploadApi";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Button, Card, Flex, Tag, Typography } from "antd";
import { useState } from "react";
import { useMyDocumentUploads } from "../hooks/useMyDocumentUploads";
import { DocumentViewerModal } from "./DocumentViewerModal";

// ─── Status tag ───────────────────────────────────────────────────────────────

function UploadStatusTag({ upload }: { upload: DocumentUpload }) {
  switch (upload.status) {
    case "VERIFIED":
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Verified
        </Tag>
      );
    case "REJECTED":
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          Rejected
        </Tag>
      );
    default:
      return (
        <Tag color="processing" icon={<LoadingOutlined />}>
          Pending review
        </Tag>
      );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

type ApplicationDocumentsSectionProps = {
  candidateId: number | undefined;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ApplicationDocumentsSection({
  candidateId,
}: ApplicationDocumentsSectionProps) {
  const token = useToken();
  const { state, actions, flags } = useMyDocumentUploads({ candidateId });

  // Single isolated boolean state — no state file needed per agent.md
  const [viewingUpload, setViewingUpload] = useState<DocumentUpload | null>(
    null,
  );

  return (
    <>
      <Card title="Uploaded documents" size="small">
        <DataLoader
          loading={state.isLoading}
          loader={<SkeletonRows count={2} variant="inline" />}
          minHeight="60px"
        >
          <ErrorAlert
            variant="section"
            error={state.sectionError}
            onRetry={actions.refetch}
          />

          <ConditionalRenderer when={!state.sectionError && !flags.hasUploads}>
            <Typography.Text type="secondary">
              No documents uploaded yet.
            </Typography.Text>
          </ConditionalRenderer>

          <ConditionalRenderer when={flags.hasUploads}>
            <Flex vertical gap={0}>
              {state.uploads.map((upload, index) => (
                <Flex
                  key={upload.id}
                  justify="space-between"
                  align="flex-start"
                  gap={12}
                  style={{
                    padding: "10px 0",
                    borderBottom:
                      index < state.uploads.length - 1
                        ? `1px solid ${token.colorBorderSecondary}`
                        : "none",
                  }}
                >
                  {/* Left — icon + filename + meta */}
                  <Flex align="flex-start" gap={10} style={{ minWidth: 0 }}>
                    <FileOutlined
                      style={{
                        fontSize: token.fontSizeLG,
                        color: token.colorTextSecondary,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <Flex vertical gap={2} style={{ minWidth: 0 }}>
                      <Typography.Text
                        ellipsis
                        style={{ fontWeight: 500 }}
                        title={upload.originalFilename}
                      >
                        {upload.originalFilename}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.fontSizeSM }}
                      >
                        {upload.documentTypeCode.replace(/_/g, " ")} ·{" "}
                        {formatBytes(upload.fileSizeBytes)} ·{" "}
                        {new Date(upload.uploadedAt).toLocaleDateString()}
                      </Typography.Text>
                      <ConditionalRenderer
                        when={
                          upload.status === "REJECTED" &&
                          !!upload.rejectionReason
                        }
                      >
                        <Typography.Text
                          type="danger"
                          style={{ fontSize: token.fontSizeSM }}
                        >
                          Reason: {upload.rejectionReason}
                        </Typography.Text>
                      </ConditionalRenderer>
                    </Flex>
                  </Flex>

                  {/* Right — status badge + view button */}
                  <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
                    <UploadStatusTag upload={upload} />
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => setViewingUpload(upload)}
                      disabled={!upload.url}
                      title={upload.url ? "View document" : "Preview not available"}
                    >
                      View
                    </Button>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </ConditionalRenderer>
        </DataLoader>
      </Card>

      <DocumentViewerModal
        upload={viewingUpload}
        open={viewingUpload !== null}
        onClose={() => setViewingUpload(null)}
      />
    </>
  );
}
