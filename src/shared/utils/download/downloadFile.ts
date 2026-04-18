import { axiosInstance } from "@/app/api/axiosInstance";
import type { AppStore } from "@/app/store";
import { getTenantFromHostname } from "@/shared/utils/tenant-util";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DownloadHttpOptions = {
  url: string;
  filename: string;
  accept?: string;
  extraHeaders?: Record<string, string>;
};

export type DownloadBlobOptions = {
  blob: Blob;
  filename: string;
};

// ─── Internal helper ──────────────────────────────────────────────────────────

function triggerAnchorDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function downloadFileFromUrl(options: DownloadHttpOptions, store: AppStore): Promise<void> {
  const { url, filename, accept, extraHeaders } = options;
  const token = store.getState().auth?.token;
  const tenant = getTenantFromHostname(window.location.hostname);

  const headers: Record<string, string> = {};
  if (accept) headers["Accept"] = accept;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (tenant) headers["X-TENANT"] = tenant;
  // extraHeaders last — caller wins on conflicts
  Object.assign(headers, extraHeaders);

  const response = await axiosInstance.get(url, { responseType: "blob", headers });
  triggerAnchorDownload(response.data as Blob, filename);
}

export function downloadBlob(options: DownloadBlobOptions): void {
  triggerAnchorDownload(options.blob, options.filename);
}
