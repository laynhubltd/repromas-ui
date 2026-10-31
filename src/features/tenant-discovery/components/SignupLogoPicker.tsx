import { CameraOutlined, DeleteOutlined, ScissorOutlined, UploadOutlined } from "@ant-design/icons";
import { Alert, Button, Flex, Radio, Slider, Typography, Upload } from "antd";
import type { RcFile } from "antd/es/upload";
import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { createImage, getRadianAngle, rotateSize } from "@/shared/utils/cropImage";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 2;
const OUTPUT_SIZE = 512;

export type SignupLogoPickerProps = {
  logoFile: File | null;
  onLogoFileChange: (file: File | null) => void;
  logoUrl?: string;
  onLogoUrlChange?: (url: string) => void;
  logoMode: "upload" | "url";
  onLogoModeChange: (mode: "upload" | "url") => void;
  disabled?: boolean;
};

async function getCroppedLogoBlob(
  imageSrc: string,
  pixelCrop: Area,
  mimeType: string,
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const rotRad = getRadianAngle(0);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, 0);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) return null;

  croppedCanvas.width = OUTPUT_SIZE;
  croppedCanvas.height = OUTPUT_SIZE;

  // Clear rect ensures transparent background remains transparent for PNG
  croppedCtx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  return new Promise((resolve) => {
    // If original is PNG or WebP, preserve that type to retain transparency
    const outputMime =
      mimeType === "image/png" || mimeType === "image/webp" ? mimeType : "image/jpeg";
    croppedCanvas.toBlob((blob) => resolve(blob), outputMime, 0.95);
  });
}

export function SignupLogoPicker({
  logoFile,
  onLogoFileChange,
  logoMode,
  onLogoModeChange,
  disabled,
}: SignupLogoPickerProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalMime, setOriginalMime] = useState<string>("image/png");
  const [fileName, setFileName] = useState<string>("logo.png");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Derive preview URL directly from logoFile; revoke previous URL on cleanup
  const previewUrl = useMemo(() => {
    if (!logoFile) return null;
    return URL.createObjectURL(logoFile);
  }, [logoFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = useCallback((file: RcFile) => {
    setValidationError(null);

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setValidationError(`Logo must be ${MAX_SIZE_MB} MB or smaller.`);
      return false;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setValidationError("Supported logo formats are JPEG, PNG, WebP, or GIF.");
      return false;
    }

    setOriginalMime(file.type || "image/png");
    setFileName(file.name || "logo.png");

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
      setIsCropping(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    });
    reader.readAsDataURL(file);

    return false; // Intercept AntD auto-upload
  }, []);

  const handleApplyCrop = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const blob = await getCroppedLogoBlob(imageSrc, croppedAreaPixels, originalMime);
      if (!blob) {
        setValidationError("Could not crop image. Please try another file.");
        return;
      }

      const ext = originalMime === "image/png" ? "png" : originalMime === "image/webp" ? "webp" : "jpg";
      const croppedFile = new File([blob], fileName.replace(/\.[^.]+$/, `.${ext}`), {
        type: originalMime === "image/png" || originalMime === "image/webp" ? originalMime : "image/jpeg",
      });

      onLogoFileChange(croppedFile);
      setIsCropping(false);
      setImageSrc(null);
    } catch {
      setValidationError("Failed to process cropped logo.");
    }
  }, [imageSrc, croppedAreaPixels, originalMime, fileName, onLogoFileChange]);

  const handleCancelCrop = useCallback(() => {
    setIsCropping(false);
    setImageSrc(null);
  }, []);

  const handleRemoveLogo = useCallback(() => {
    onLogoFileChange(null);
    setImageSrc(null);
    setIsCropping(false);
    setValidationError(null);
  }, [onLogoFileChange]);

  return (
    <Flex vertical gap={12}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
        <Radio.Group
          value={logoMode}
          onChange={(e) => onLogoModeChange(e.target.value)}
          optionType="button"
          size="middle"
          disabled={disabled}
        >
          <Radio.Button value="upload">Upload Image File</Radio.Button>
          <Radio.Button value="url">Remote Image URL</Radio.Button>
        </Radio.Group>
        {logoFile && logoMode === "upload" && !isCropping && (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={handleRemoveLogo}
          >
            Remove logo
          </Button>
        )}
      </Flex>

      {validationError && (
        <Alert type="error" message={validationError} showIcon closable onClose={() => setValidationError(null)} />
      )}

      {logoMode === "upload" && (
        <>
          {/* 1. Cropper View (when a new file is chosen) */}
          {isCropping && imageSrc && (
            <Flex
              vertical
              gap={12}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 280,
                  background: "#1e1b4b",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                />
              </div>

              <Flex vertical gap={4}>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  Zoom to fit your institution's crest inside the square:
                </Typography.Text>
                <Slider
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={setZoom}
                />
              </Flex>

              <Flex gap={8} justify="flex-end">
                <Button onClick={handleCancelCrop}>Cancel</Button>
                <Button type="primary" icon={<ScissorOutlined />} onClick={handleApplyCrop}>
                  Apply Crop & Save
                </Button>
              </Flex>
            </Flex>
          )}

          {/* 2. Selected Logo Preview */}
          {!isCropping && previewUrl && (
            <Flex
              align="center"
              gap={16}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 14,
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#f1f5f9",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={previewUrl}
                  alt="Institution logo preview"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <Flex vertical style={{ minWidth: 0, flex: 1 }}>
                <Typography.Text strong ellipsis>
                  {logoFile?.name || "logo.png"}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB · 512×512 px ready` : ""}
                </Typography.Text>
              </Flex>
              <Upload
                accept={ALLOWED_MIME_TYPES.join(",")}
                showUploadList={false}
                beforeUpload={handleFileSelect}
                disabled={disabled}
              >
                <Button icon={<CameraOutlined />}>Change</Button>
              </Upload>
            </Flex>
          )}

          {/* 3. Drop/Upload Area (when no logo selected and not cropping) */}
          {!isCropping && !previewUrl && (
            <Upload.Dragger
              accept={ALLOWED_MIME_TYPES.join(",")}
              multiple={false}
              showUploadList={false}
              beforeUpload={handleFileSelect}
              disabled={disabled}
              style={{
                borderRadius: 12,
                padding: "20px 14px",
                background: "#ffffff",
                borderColor: "#cbd5e1",
              }}
            >
              <p className="ant-upload-drag-icon" style={{ margin: "0 0 8px" }}>
                <UploadOutlined style={{ fontSize: 32, color: "#6d28d9" }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: 14, margin: "0 0 4px", fontWeight: 600 }}>
                Click or drag your institution logo here
              </p>
              <p className="ant-upload-hint" style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                PNG, JPEG, WebP or GIF · Max {MAX_SIZE_MB} MB (will crop to 512×512 px)
              </p>
            </Upload.Dragger>
          )}
        </>
      )}
    </Flex>
  );
}
