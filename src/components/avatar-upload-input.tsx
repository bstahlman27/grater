"use client";

import { useState } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";

const avatarSize = 512;
const maxSourceSize = 10 * 1024 * 1024;
const maxCompressedSize = 2 * 1024 * 1024;
const acceptedImageTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type AvatarUploadInputProps = {
  currentAvatarUrl: string | null;
  displayName: string;
};

function bytesToKb(size: number) {
  return Math.max(1, Math.round(size / 1024));
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    image.src = url;
  });
}

async function compressAvatar(file: File) {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser could not prepare that image.");
  }

  canvas.width = avatarSize;
  canvas.height = avatarSize;

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2);

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    avatarSize,
    avatarSize,
  );

  const outputTypes = ["image/webp", "image/jpeg"];
  const qualities = [0.86, 0.78, 0.68, 0.58];

  for (const outputType of outputTypes) {
    for (const quality of qualities) {
      const blob = await canvasToBlob(canvas, outputType, quality);

      if (blob && blob.size <= maxCompressedSize) {
        return {
          dataUrl: await blobToDataUrl(blob),
          size: blob.size,
        };
      }
    }
  }

  throw new Error("That image could not be compressed below 2 MB.");
}

export function AvatarUploadInput({
  currentAvatarUrl,
  displayName,
}: AvatarUploadInputProps) {
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const [status, setStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div>
      <label
        className="block text-sm font-medium text-zinc-700"
        htmlFor="avatarFile"
      >
        Profile picture
      </label>
      <div className="mt-2 flex items-center gap-4">
        <ProfileAvatar
          avatarUrl={previewUrl}
          displayName={displayName}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <input name="avatarDataUrl" type="hidden" value={avatarDataUrl} />
          <input
            accept="image/gif,image/jpeg,image/png,image/webp"
            className="block w-full rounded-md border border-zinc-300 bg-white text-sm text-zinc-700 file:mr-3 file:min-h-11 file:border-0 file:bg-zinc-950 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-600"
            id="avatarFile"
            onChange={async (event) => {
              const file = event.target.files?.[0];

              setError("");
              setStatus("");
              setAvatarDataUrl("");
              setPreviewUrl(currentAvatarUrl);

              if (!file) {
                return;
              }

              if (!acceptedImageTypes.has(file.type)) {
                setError("Use a PNG, JPG, GIF, or WebP image.");
                event.target.value = "";
                return;
              }

              if (file.size > maxSourceSize) {
                setError("Choose an image that is 10 MB or smaller.");
                event.target.value = "";
                return;
              }

              setIsProcessing(true);

              try {
                const compressed = await compressAvatar(file);
                setAvatarDataUrl(compressed.dataUrl);
                setPreviewUrl(compressed.dataUrl);
                setStatus(`Ready to upload: ${bytesToKb(compressed.size)} KB`);
              } catch (caughtError) {
                setError(
                  caughtError instanceof Error
                    ? caughtError.message
                    : "Could not prepare that image.",
                );
                event.target.value = "";
              } finally {
                setIsProcessing(false);
              }
            }}
            type="file"
          />
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        PNG, JPG, GIF, or WebP. Up to 10 MB; Grater shrinks it before saving.
      </p>
      {isProcessing ? (
        <p className="mt-2 text-xs font-medium text-zinc-600">
          Preparing image...
        </p>
      ) : null}
      {status ? (
        <p className="mt-2 text-xs font-medium text-emerald-600">{status}</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
