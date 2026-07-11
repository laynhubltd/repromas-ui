import { useIsMobile } from "@/hooks/useBreakpoint";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { CameraOutlined, UploadOutlined } from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Flex,
    Slider,
    theme,
    Typography,
    Upload,
} from "antd";
import Cropper from "react-easy-crop";

import {
  DEFAULT_PHOTO_SECTION_DESCRIPTION,
  DEFAULT_PHOTO_SECTION_TITLE,
  DEFAULT_PICTURE_CROP_ASPECT,
  DEFAULT_PICTURE_MAX_SIZE_MB,
  DEFAULT_PICTURE_OUTPUT_HEIGHT,
  DEFAULT_PICTURE_OUTPUT_WIDTH,
} from "../constants/pictureUploader";
import { useImageCropUploader } from "../hooks/useImageCropUploader";
import type { PictureUploaderProps } from "../types/pictureUploader";
import { truncateFileName } from "../utils/truncateFileName";

export function PictureUploader<TData = unknown, TPayload = unknown>({
  useGetQuery,
  useUploadMutation,
  getExistingImageUrl,
  uploadPayloadFormatter,
  onSuccess,
  onError,
  title = DEFAULT_PHOTO_SECTION_TITLE,
  description = DEFAULT_PHOTO_SECTION_DESCRIPTION,
  maxSizeMB = DEFAULT_PICTURE_MAX_SIZE_MB,
  aspectRatio = DEFAULT_PICTURE_CROP_ASPECT,
  outputWidth = DEFAULT_PICTURE_OUTPUT_WIDTH,
  outputHeight = DEFAULT_PICTURE_OUTPUT_HEIGHT,
}: PictureUploaderProps<TData, TPayload>) {
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  const { state, actions, flags } = useImageCropUploader({
    useGetQuery,
    useUploadMutation,
    getExistingImageUrl,
    uploadPayloadFormatter,
    maxSizeMB,
    outputWidth,
    outputHeight,
    onSuccess,
    onError,
  });

  const cropperHeight = isMobile ? "clamp(220px, 42vh, 320px)" : 360;
  const previewWidth = isMobile ? "min(200px, 64vw)" : 240;

  const choosePhotoLabel = state.selectedFileName
    ? `Change photo (${truncateFileName(state.selectedFileName, isMobile ? 18 : 28)})`
    : flags.hasExistingProfilePicture
      ? "Replace photo"
      : isMobile
        ? "Take or choose photo"
        : "Choose photo";

  return (
    <Card
      title={title}
      bordered
      style={{
        width: "100%",
        height: "100%",
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorderSecondary,
      }}
    >
      <Flex vertical gap={token.paddingMD}>
        <Typography.Paragraph
          type="secondary"
          style={{ margin: 0, fontSize: token.fontSizeSM }}
        >
          {flags.hasExistingProfilePicture
            ? flags.isEditingNewPhoto
              ? "Crop your new photo below, then upload to replace your current picture."
              : description
            : "A profile photo is required before you can continue. This image is used for official documents."}
        </Typography.Paragraph>

        <ConditionalRenderer when={flags.showExistingPhoto}>
          <Flex vertical align="center" gap={token.paddingSM}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              Current photo
            </Typography.Text>
            <div
              style={{
                width: previewWidth,
                aspectRatio: `${outputWidth} / ${outputHeight}`,
                padding: 3,
                borderRadius: token.borderRadiusLG,
                background: `linear-gradient(145deg, ${token.colorPrimary}, ${token.colorPrimaryBorder ?? token.colorPrimary})`,
                boxShadow: token.boxShadowSecondary,
              }}
            >
              <img
                src={state.existingProfilePictureUrl ?? undefined}
                alt="Current profile photograph"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: token.borderRadius,
                  border: `2px solid ${token.colorBgContainer}`,
                  background: token.colorBgLayout,
                }}
              />
            </div>
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer when={!flags.hasExistingProfilePicture}>
          <Alert
            type="info"
            showIcon
            icon={<CameraOutlined />}
            message="Photo requirements"
            description={
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 16,
                  fontSize: token.fontSizeSM,
                }}
              >
                <li>JPEG, PNG, GIF, or WebP · max {maxSizeMB} MB</li>
                <li>
                  Output {outputWidth}×{outputHeight}px (
                  {aspectRatio === 0.75
                    ? "3:4 passport ratio"
                    : "custom aspect"}
                  )
                </li>
                <li>Clear, recent head-and-shoulders photo</li>
              </ul>
            }
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={Boolean(state.validationError)}>
          <Alert type="error" message={state.validationError} showIcon />
        </ConditionalRenderer>

        <Upload
          accept={state.accept}
          showUploadList={false}
          beforeUpload={actions.handleFileSelect}
          disabled={state.isUploading}
          capture={isMobile ? "user" : undefined}
          style={{ width: "100%" }}
        >
          <Button
            icon={<UploadOutlined />}
            disabled={state.isUploading}
            block={isMobile}
            size={isMobile ? "large" : "middle"}
          >
            {choosePhotoLabel}
          </Button>
        </Upload>

        <ConditionalRenderer when={Boolean(state.imageSrc)}>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: cropperHeight,
              minHeight: 220,
              background: token.colorBgLayout,
              borderRadius: token.borderRadius,
              overflow: "hidden",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <Cropper
              image={state.imageSrc ?? undefined}
              crop={state.crop}
              zoom={state.zoom}
              rotation={state.rotation}
              aspect={aspectRatio}
              onCropChange={actions.handleCropChange}
              onZoomChange={actions.handleZoomChange}
              onRotationChange={actions.handleRotationChange}
              onCropComplete={actions.handleCropComplete}
              zoomWithScroll={!isMobile}
              showGrid={!isMobile}
            />
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={Boolean(state.imageSrc)}>
          <Flex vertical gap={isMobile ? 8 : 12}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              Pinch or drag to reposition · adjust zoom to frame your face
            </Typography.Text>
            <Flex vertical gap={4}>
              <Typography.Text type="secondary">Zoom</Typography.Text>
              <Slider
                min={1}
                max={3}
                step={0.01}
                value={state.zoom}
                onChange={actions.handleZoomChange}
                disabled={state.isUploading}
                tooltip={{ open: isMobile ? false : undefined }}
              />
            </Flex>
            <Flex vertical gap={4}>
              <Typography.Text type="secondary">Rotate</Typography.Text>
              <Slider
                min={0}
                max={360}
                step={1}
                value={state.rotation}
                onChange={actions.handleRotationChange}
                disabled={state.isUploading}
                tooltip={{ open: isMobile ? false : undefined }}
              />
            </Flex>
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer when={flags.isEditingNewPhoto}>
          <DataLoader loading={state.isUploading}>
            <Button
              type="primary"
              size="large"
              block
              onClick={() => void actions.handleUpload()}
              disabled={!flags.canUpload || state.isUploading}
              loading={state.isUploading}
            >
              {flags.hasExistingProfilePicture
                ? "Save new photo"
                : "Upload photo"}
            </Button>
          </DataLoader>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            Please wait momentarily after clicking upload while the picture
            crops and processes.
          </Typography.Text>
        </ConditionalRenderer>
      </Flex>
    </Card>
  );
}
