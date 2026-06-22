import type { DocumentUpload } from "@/features/dynamic-form/api/documentUploadApi";
import { useToken } from "@/shared/hooks/useToken";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Button, Flex, Modal, Spin, Typography } from "antd";
import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure the pdf.js worker — use the bundled worker from the package
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isPdf(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

type DocumentViewerModalProps = {
  upload: DocumentUpload | null;
  open: boolean;
  onClose: () => void;
};

// ─── PDF viewer ───────────────────────────────────────────────────────────────

function PdfViewer({ url }: { url: string }) {
  const token = useToken();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
      setIsLoading(false);
    },
    [],
  );

  return (
    <Flex vertical align="center" gap={12}>
      {isLoading && (
        <Flex justify="center" style={{ padding: 40 }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} />} />
        </Flex>
      )}

      <Document
        file={url}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={() => setIsLoading(false)}
        loading={null}
      >
        <Page
          pageNumber={page}
          width={Math.min(window.innerWidth - 96, 760)}
          renderAnnotationLayer
          renderTextLayer
        />
      </Document>

      {numPages && numPages > 1 && (
        <Flex
          align="center"
          gap={12}
          style={{
            padding: "8px 16px",
            borderRadius: token.borderRadius,
            border: `1px solid ${token.colorBorder}`,
            background: token.colorBgContainer,
          }}
        >
          <Button
            size="small"
            icon={<ArrowLeftOutlined />}
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <Typography.Text style={{ fontSize: token.fontSizeSM }}>
            Page {page} of {numPages}
          </Typography.Text>
          <Button
            size="small"
            icon={<ArrowRightOutlined />}
            disabled={page >= numPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DocumentViewerModal({
  upload,
  open,
  onClose,
}: DocumentViewerModalProps) {
  const token = useToken();

  const url = upload?.url ?? null;
  const mimeType = upload?.mimeType ?? "";
  const filename = upload?.originalFilename ?? "Document";

  const renderContent = () => {
    if (!url) {
      return (
        <Flex
          justify="center"
          align="center"
          style={{ padding: 48 }}
        >
          <Typography.Text type="secondary">
            Preview URL is not available. The link may have expired — please
            reload the page.
          </Typography.Text>
        </Flex>
      );
    }

    if (isPdf(mimeType)) {
      return <PdfViewer url={url} />;
    }

    if (isImage(mimeType)) {
      return (
        <Flex justify="center">
          <img
            src={url}
            alt={filename}
            style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain" }}
          />
        </Flex>
      );
    }

    // Fallback — iframe for Word, etc.
    return (
      <iframe
        src={url}
        title={filename}
        style={{ width: "100%", height: "70vh", border: "none" }}
      />
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Flex vertical gap={2}>
          <Typography.Text strong>{filename}</Typography.Text>
          {upload && (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM, fontWeight: 400 }}
            >
              {upload.documentTypeCode.replace(/_/g, " ")} ·{" "}
              {formatBytes(upload.fileSizeBytes)} · {mimeType}
            </Typography.Text>
          )}
        </Flex>
      }
      footer={
        url ? (
          <Button
            type="link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: 0 }}
          >
            Open in new tab
          </Button>
        ) : null
      }
      width={Math.min(window.innerWidth - 48, 840)}
      styles={{ body: { overflowY: "auto", maxHeight: "80vh", padding: "16px 24px" } }}
      destroyOnClose
    >
      {renderContent()}
    </Modal>
  );
}
