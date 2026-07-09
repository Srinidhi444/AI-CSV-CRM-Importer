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
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              GrowEasy Assignment Build
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                AI CSV Importer for CRM Lead Extraction
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
                Upload any valid CSV, preview it locally, and convert inconsistent source columns
                into GrowEasy CRM records only after confirmation.
              </p>
            </div>
          </div>

          <ThemeToggle />
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="mb-5 space-y-1">
              <h2 className="text-xl font-semibold">Import Leads via CSV</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Upload a CSV file to bulk import leads into the system.
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
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {file.name}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Review and Confirm</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Preview first, then trigger backend AI extraction only on confirmation.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
                  <p>
                    Step 1: CSV is parsed in-browser for preview.
                  </p>
                  <p>
                    Step 2: On confirm, your backend securely processes the file and calls the LLM server-side.
                  </p>
                  <p>
                    Step 3: Parsed CRM records and skipped rows are returned as structured JSON.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void processImport()}
                  disabled={!isReadyForImport || isProcessing || isParsing}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Confirm Import"}
                </button>

                <button
                  type="button"
                  onClick={clearSession}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
                >
                  Reset
                </button>
              </div>

              {isParsing ? <ProgressBar label="Parsing CSV locally..." /> : null}
              {isProcessing ? <ProgressBar label="Processing with secure backend AI extraction..." /> : null}

              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted-foreground)]">
                Status: <span className="font-semibold text-[var(--foreground)]">{stage}</span>
              </div>
            </div>
          </div>
        </section>

        {parseError ? <ErrorBanner message={parseError} /> : null}
        {error ? <ErrorBanner message={error} /> : null}

        {preview ? <PreviewTable preview={preview} /> : null}

        {stage === "completed" && result ? (
          <section className="space-y-6">
            <ResultsSummary result={result} />
            <ImportedTable records={result.imported} />
            <SkippedTable records={result.skipped} />
          </section>
        ) : null}
      </div>
    </main>
  );
}