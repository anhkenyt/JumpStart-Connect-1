import { useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useActOnJumpstartJob } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Page } from "@/components/shell";
import { Skel } from "@/components/bits";
import { StatusChip } from "@/components/job-card";
import { useToast } from "@/hooks/use-toast";
import { useDemo, aed, errMsg } from "@/lib/demo";
import { ArrowRight, BadgeCheck, Clock3, Download, Receipt, Wallet, XCircle } from "lucide-react";

type FeeOutcome = "all" | "earned" | "pending" | "estimate" | "no_fee";

const NO_FEE_STATUSES = ["declined", "cancelled", "failed"];

function feeOutcome(status: string): Exclude<FeeOutcome, "all"> {
  if (status === "completed") return "earned";
  if (status === "accepted" || status === "arrived") return "pending";
  if (status === "pending") return "estimate";
  return "no_fee";
}

function feeOutcomeLabel(status: string) {
  const outcome = feeOutcome(status);
  if (outcome === "earned") return "Earned";
  if (outcome === "pending") return "Pending fee";
  if (outcome === "estimate") return "Fee estimate";
  return "No fee";
}

function csvCell(value: string | number) {
  const text = String(value);
  const safeText = typeof value === "string" && /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

export default function AdminPage() {
  const { state, isLoading, isError, refetch, userById, setUserId, invalidate } = useDemo();
  const { toast } = useToast();
  const acceptJob = useActOnJumpstartJob();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<FeeOutcome>("all");
  const [respondingJobId, setRespondingJobId] = useState<string | null>(null);
  const jobs = state?.jobs ?? [];
  const validDateRange = !startDate || !endDate || startDate <= endDate;
  const filteredJobs = validDateRange
    ? jobs.filter((job) => {
        const timestamp = new Date(job.updatedAt).getTime();
        if (startDate && timestamp < new Date(`${startDate}T00:00:00`).getTime()) return false;
        if (endDate) {
          const endExclusive = new Date(`${endDate}T00:00:00`);
          endExclusive.setDate(endExclusive.getDate() + 1);
          if (timestamp >= endExclusive.getTime()) return false;
        }
        return outcomeFilter === "all" || feeOutcome(job.status) === outcomeFilter;
      })
    : [];
  const orderedJobs = [...filteredJobs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const waitingOnSuccess = filteredJobs
    .filter((job) => job.status === "accepted" || job.status === "arrived")
    .reduce((total, job) => total + job.platformFee, 0);
  const estimatedFees = filteredJobs
    .filter((job) => job.status === "pending")
    .reduce((total, job) => total + job.platformFee, 0);
  const completedJobs = filteredJobs.filter((job) => job.status === "completed");
  const earnedFees = completedJobs.reduce((total, job) => total + job.platformFee, 0);
  const noFeeJobs = filteredJobs.filter((job) => NO_FEE_STATUSES.includes(job.status));

  function downloadLedger() {
    const headers = [
      "Job ID",
      "Driver quote (AED)",
      "Platform fee (AED)",
      "Helper payout (AED)",
      "Status",
      "Fee outcome",
      "Timestamp",
    ];
    const rows = orderedJobs.map((job) => [
      job.id,
      job.price.toFixed(2),
      job.platformFee.toFixed(2),
      job.helperEarnings.toFixed(2),
      job.status,
      feeOutcomeLabel(job.status),
      job.updatedAt,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fee-ledger_${startDate || "all"}_to_${endDate || "all"}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function acceptAsHelper(job: (typeof jobs)[number]) {
    setRespondingJobId(job.id);
    acceptJob.mutate(
      { id: job.id, data: { actorId: job.helperId, action: "accept" } },
      {
        onSuccess: () => {
          invalidate();
          setRespondingJobId(null);
          toast({
            title: `Accepted as ${userById(job.helperId)?.name ?? "helper"}`,
            description: "The fee is still pending until the driver confirms a successful start.",
          });
        },
        onError: (error) => {
          setRespondingJobId(null);
          toast({ title: "Couldn't accept the request", description: errMsg(error), variant: "destructive" });
        },
      },
    );
  }

  if (isLoading) {
    return (
      <Page>
        <h1 className="font-display text-3xl font-bold">Admin overview</h1>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Skel className="h-28" /><Skel className="h-28" /><Skel className="h-28" /><Skel className="h-28" />
        </div>
        <Skel className="mt-6 h-56" />
      </Page>
    );
  }

  if (isError || !state) {
    return (
      <Page>
        <h1 className="font-display text-3xl font-bold">Admin overview</h1>
        <div className="mt-6 rounded-2xl border border-border bg-card p-5" data-testid="admin-load-error">
          <p className="font-semibold">Couldn’t load the demo fee ledger.</p>
          <Button className="mt-4 rounded-full" onClick={refetch}>Try again</Button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold" data-testid="text-admin-title">Admin overview</h1>
          <p className="mt-1 text-muted-foreground">Fee ledger for this demo session. No real payments are processed.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900">
          <Receipt className="h-3.5 w-3.5" /> Demo only · no admin login
        </span>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5" aria-label="Fee summary for selected filters">
        <SummaryCard
          label="Fees earned"
          value={aed(earnedFees)}
          detail="Successful jumps only"
          icon={<Wallet className="h-4 w-4" />}
          testId="text-fees-earned"
        />
        <SummaryCard
          label="Pending fee"
          value={aed(waitingOnSuccess)}
          detail="Accepted or arrived; not earned"
          icon={<Clock3 className="h-4 w-4" />}
          testId="text-fees-pending"
        />
        <SummaryCard
          label="Fee estimates"
          value={aed(estimatedFees)}
          detail="Awaiting helper acceptance"
          icon={<Receipt className="h-4 w-4" />}
          testId="text-fees-estimated"
        />
        <SummaryCard
          label="Successful jumps"
          value={String(completedJobs.length)}
          detail="Driver confirmed started"
          icon={<BadgeCheck className="h-4 w-4" />}
          testId="text-successful-jobs"
        />
        <SummaryCard
          label="No-fee jobs"
          value={String(noFeeJobs.length)}
          detail="Failed, declined, or cancelled"
          icon={<XCircle className="h-4 w-4" />}
          testId="text-no-fee-jobs"
        />
      </section>

      <section className="mt-8" aria-labelledby="fee-ledger-heading">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="fee-ledger-heading" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Job fee ledger</h2>
            <p className="mt-1 text-xs text-muted-foreground">The fee is 10% of the helper’s agreed quote. It is counted as earned only after a successful start.</p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <Link href="/activity" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline" data-testid="link-admin-activity">
              Activity <ArrowRight className="h-4 w-4" />
            </Link>
            <Button
              className="rounded-full"
              onClick={downloadLedger}
              disabled={orderedJobs.length === 0}
              data-testid="button-export-fee-ledger"
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 rounded-2xl border border-card-border bg-card p-4 sm:grid-cols-3">
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            From date
            <Input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              aria-label="Filter from date"
              data-testid="input-fee-start-date"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            To date
            <Input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              aria-label="Filter to date"
              data-testid="input-fee-end-date"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Job outcome
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={outcomeFilter}
              onChange={(event) => setOutcomeFilter(event.target.value as FeeOutcome)}
              aria-label="Filter by job outcome"
              data-testid="select-fee-outcome"
            >
              <option value="all">All outcomes</option>
              <option value="earned">Earned · completed</option>
              <option value="pending">Pending · accepted or arrived</option>
              <option value="estimate">Estimate · awaiting acceptance</option>
              <option value="no_fee">No fee · failed, declined, or cancelled</option>
            </select>
          </label>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground" aria-live="polite">
          <p>{validDateRange ? `Showing ${orderedJobs.length} of ${jobs.length} jobs` : "Start date must be on or before the end date"}</p>
          <p>Summary reflects the selected dates and outcome.</p>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center" data-testid="admin-empty-ledger">
            <Receipt className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">No requests yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Demo fees will appear here when drivers request help.</p>
            <Button asChild className="mt-4 rounded-full"><Link href="/">Open the map</Link></Button>
          </div>
        ) : orderedJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center" data-testid="admin-no-filtered-jobs">
            <Receipt className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">{validDateRange ? "No jobs match these filters" : "Check the selected date range"}</p>
            <p className="mt-1 text-sm text-muted-foreground">Change the dates or outcome to see fee history.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {orderedJobs.map((job) => {
              const driver = userById(job.requesterId);
              const helper = userById(job.helperId);
              const isEarned = job.status === "completed";
              const isAccepted = job.status === "accepted" || job.status === "arrived";
              const isWaiting = job.status === "pending";
              const feeState = isEarned
                ? "Earned · simulated"
                : isAccepted
                  ? "Pending · not earned"
                  : isWaiting
                    ? "Estimate · awaiting acceptance"
                    : "No fee";

              return (
                <li key={job.id} className="rounded-2xl border border-card-border bg-card p-4" data-testid={`row-fee-job-${job.id}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{driver?.name ?? "Driver"}</span>
                    <span className="text-sm text-muted-foreground">→ {helper?.name ?? "Helper"}</span>
                    <div className="ml-auto"><StatusChip status={job.status} /></div>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{format(new Date(job.updatedAt), "d MMM yyyy, HH:mm")} · {job.locationLabel}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-3 text-sm">
                    <LedgerAmount label="Driver quote" value={aed(job.price)} />
                    <LedgerAmount
                      label={isEarned ? "Fee earned" : "Platform fee"}
                      value={aed(job.platformFee)}
                      emphasis
                    />
                    <LedgerAmount label="Helper payout" value={aed(job.helperEarnings)} />
                  </div>
                  <p
                    className={`mt-2 text-xs font-medium ${isEarned ? "text-emerald-700" : isAccepted ? "text-amber-700" : "text-muted-foreground"}`}
                    data-testid={`status-fee-${job.id}`}
                  >
                    {feeState}
                  </p>
                  {job.status === "pending" && (
                    <div className="mt-3">
                      <Button
                        data-testid={`button-demo-accept-${job.id}`}
                        size="sm"
                        className="rounded-full"
                        disabled={acceptJob.isPending}
                        onClick={() => acceptAsHelper(job)}
                      >
                        {respondingJobId === job.id ? "Accepting…" : `Accept as ${helper?.name ?? "helper"}`}
                      </Button>
                      <p className="mt-1.5 text-xs text-muted-foreground">Demo action: accepts this request as the selected helper.</p>
                    </div>
                  )}
                  {job.status === "accepted" && (
                    <Button
                      data-testid={`link-demo-helper-${job.id}`}
                      asChild
                      size="sm"
                      variant="outline"
                      className="mt-3 rounded-full"
                    >
                      <Link href="/help" onClick={() => setUserId(job.helperId)}>
                        Continue as {helper?.name ?? "helper"} · mark arrived
                      </Link>
                    </Button>
                  )}
                  {job.status === "arrived" && (
                    <Button
                      data-testid={`link-demo-driver-${job.id}`}
                      asChild
                      size="sm"
                      className="mt-3 rounded-full"
                    >
                      <Link href="/activity" onClick={() => setUserId(job.requesterId)}>
                        Continue as {driver?.name ?? "driver"} · confirm result
                      </Link>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-6 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
        This is a demo ledger, not a protected admin account. Fees are simulated, and accepted jobs are not charged unless the driver confirms a successful start.
      </p>
    </Page>
  );
}

function SummaryCard({ label, value, detail, icon, testId }: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  testId: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-card-border bg-card p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">{icon}<span>{label}</span></div>
      <p className="mt-2 truncate font-num text-xl font-bold sm:text-2xl" data-testid={testId}>{value}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{detail}</p>
    </div>
  );
}

function LedgerAmount({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      <p className={`mt-0.5 truncate font-num text-sm ${emphasis ? "font-semibold text-primary" : "font-medium"}`}>{value}</p>
    </div>
  );
}
