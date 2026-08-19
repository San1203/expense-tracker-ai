"use client";

import { AlertCircle, CheckCircle2, Loader2, Rocket } from "lucide-react";
import { destinationMeta } from "@/lib/cloud-export/destinationMeta";
import { UseCloudExportReturn } from "@/hooks/useCloudExport";
import TemplatePicker from "./TemplatePicker";
import DestinationPicker from "./DestinationPicker";

type ExportPanelProps = Pick<
  UseCloudExportReturn,
  | "selectedTemplate"
  | "setSelectedTemplate"
  | "taxYear"
  | "setTaxYear"
  | "availableYears"
  | "selectedDestination"
  | "setSelectedDestination"
  | "connections"
  | "connectingId"
  | "connectIntegration"
  | "emailRecipient"
  | "setEmailRecipient"
  | "isDestinationReady"
  | "recordCount"
  | "processing"
  | "runError"
  | "lastRunResult"
  | "runExport"
>;

export default function ExportPanel({
  selectedTemplate,
  setSelectedTemplate,
  taxYear,
  setTaxYear,
  availableYears,
  selectedDestination,
  setSelectedDestination,
  connections,
  connectingId,
  connectIntegration,
  emailRecipient,
  setEmailRecipient,
  isDestinationReady,
  recordCount,
  processing,
  runError,
  lastRunResult,
  runExport,
}: ExportPanelProps) {
  const destination = destinationMeta(selectedDestination);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Report template</h3>
        <TemplatePicker
          value={selectedTemplate}
          onChange={setSelectedTemplate}
          taxYear={taxYear}
          onTaxYearChange={setTaxYear}
          availableYears={availableYears}
        />
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Send to</h3>
        <DestinationPicker
          value={selectedDestination}
          onChange={setSelectedDestination}
          connections={connections}
          connectingId={connectingId}
          onConnect={connectIntegration}
          emailRecipient={emailRecipient}
          onEmailRecipientChange={setEmailRecipient}
        />
      </section>

      {runError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{runError}</span>
        </div>
      )}

      {lastRunResult && !processing.active && (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Exported {lastRunResult.recordCount} record{lastRunResult.recordCount === 1 ? "" : "s"} via{" "}
            {destinationMeta(lastRunResult.destinationId).name}.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-700">
            {recordCount} record{recordCount === 1 ? "" : "s"} in this report
          </p>
          {!isDestinationReady && (
            <p className="mt-0.5 text-[11px] text-amber-600">Connect {destination.name} first to enable this export.</p>
          )}
        </div>
        <button
          onClick={runExport}
          disabled={processing.active || recordCount === 0 || !isDestinationReady}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing.active ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {processing.label}
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Run export
            </>
          )}
        </button>
      </div>

      {processing.active && processing.stepTotal > 1 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((processing.stepIndex + 1) / processing.stepTotal) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
