import {
  PROFILE_PICTURE_OUTPUT_MIME,
  PROFILE_PICTURE_OUTPUT_WIDTH,
  PROFILE_PICTURE_OUTPUT_HEIGHT,
} from "@/shared/constants/profilePictureOptions";
import type { CropAreaPixels } from "../types/profile-picture";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export async function createCroppedImageFile(
  imageSrc: string,
  pixelCrop: CropAreaPixels,
  rotation = 0,
  outputWidth = PROFILE_PICTURE_OUTPUT_WIDTH,
  outputHeight = PROFILE_PICTURE_OUTPUT_HEIGHT,
  outputMime = PROFILE_PICTURE_OUTPUT_MIME,
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context.");
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation,
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    throw new Error("Could not get cropped canvas context.");
  }

  croppedCanvas.width = outputWidth;
  croppedCanvas.height = outputHeight;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    croppedCanvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Failed to create cropped image."));
          return;
        }
        resolve(result);
      },
      outputMime,
      0.92,
    );
  });

  return new File([blob], "profile-picture.jpg", { type: outputMime });
}

