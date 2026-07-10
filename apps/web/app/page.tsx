"use client";

import { useCallback } from "react";
import { DropzoneUpload } from "@/components/upload/DropzoneUpload";
import { SampleTemplateLink } from "@/components/upload/SampleTemplateLink";
import { PreviewTable } from "@/components/preview/PreviewTable";
import { ResultsSummary } from "@/components/results/ResultsSummary";
import { ImportedTable } from "@/components/results/ImportedTable";
import { SkippedTable } from "@/components/results/SkippedTable";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useCsvParser } from "@/hooks/useCsvParser";
import { useImportSession } from "@/hooks/useImportSession";

export default function HomePage() {
  const {
    file,
    preview,
    result,
    error,
    stage,
    setSelectedFile,
    setPreviewData,
    clearSession,
    processImport,
    isReadyForImport,
    isProcessing,
  } = useImportSession();

  const { parseFile, isParsing, parseError, clearParseError } = useCsvParser();

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setSelectedFile(selectedFile);
      clearParseError();

      try {
        const parsedPreview = await parseFile(selectedFile);
        setPreviewData(parsedPreview);
      } catch {
        setPreviewData(null);
      }
    },
    [clearParseError, parseFile, setPreviewData, setSelectedFile],
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-6">
        <div className="space-y-6">
          <header className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12l9-9 9 9M5 10v10h14V10" />
                </svg>
              </div>

              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  GrowEasy CRM Import
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  AI-powered CSV lead normalization
                </p>
              </div>
            </div>

            <ThemeToggle />
          </header>

          <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="mb-5 space-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  Import Leads
                </h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Upload a CSV, preview it locally, then confirm secure backend extraction.
                </p>
              </div>

              <div className="space-y-4">
                <DropzoneUpload
                  onFileSelect={handleFileSelect}
                  disabled={isParsing || isProcessing}
                />

                <div className="flex flex-wrap gap-3">
                  <SampleTemplateLink />
                </div>

                {file ? (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--foreground)]">
                          {file.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>

                      <div className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted-foreground)]">
                        CSV
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  Review & Confirm
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  The preview stays local. AI extraction starts only after confirmation.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-[11px] font-medium">
                        1
                      </span>
                      <p>CSV is parsed in-browser for preview.</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-[11px] font-medium">
                        2
                      </span>
                      <p>On confirm, the backend processes the file and calls the LLM securely.</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-[11px] font-medium">
                        3
                      </span>
                      <p>Imported and skipped rows are returned as structured CRM output.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void processImport()}
                    disabled={!isReadyForImport || isProcessing || isParsing}
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Confirm Import"}
                  </button>

                  <button
                    type="button"
                    onClick={clearSession}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
                  >
                    Reset
                  </button>
                </div>

                {isParsing ? <ProgressBar label="Parsing CSV locally..." /> : null}
                {isProcessing ? (
                  <ProgressBar label="Processing with secure backend AI extraction..." />
                ) : null}

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
                  <span className="text-[var(--muted-foreground)]">Status: </span>
                  <span className="font-medium capitalize text-[var(--foreground)]">
                    {stage}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {parseError ? <ErrorBanner message={parseError} /> : null}
          {error ? <ErrorBanner message={error} /> : null}

          {preview ? <PreviewTable preview={preview} /> : null}

          {stage === "completed" && result ? (
            <section className="space-y-5">
              <ResultsSummary result={result} />
              <ImportedTable records={result.imported} />
              <SkippedTable records={result.skipped} />
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}