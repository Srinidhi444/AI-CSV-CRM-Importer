"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface DropzoneUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function DropzoneUpload({
  onFileSelect,
  disabled = false,
}: DropzoneUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={[
        "flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed px-6 py-10 text-center transition",
        isDragActive
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]",
        disabled ? "cursor-not-allowed opacity-60" : "",
      ].join(" ")}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-2xl shadow-sm">
          ⤴
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Drop your CSV file here
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            or click to browse files
          </p>
        </div>

        <div className="space-y-2 text-xs text-[var(--muted-foreground)]">
          <p>Supported file: .csv (max 5 MB)</p>
          <p>
            The system previews locally first, then securely sends it to your backend after confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}