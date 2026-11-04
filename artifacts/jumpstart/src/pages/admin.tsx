import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/shell";
import { Skel } from "@/components/bits";
import { StatusChip } from "@/components/job-card";
import { useDemo, aed } from "@/lib/demo";
import { ArrowRight, BadgeCheck, Clock3, Receipt, Wallet, XCircle } from "lucide-react";

export default function AdminPage() {
  const { state, isLoading, isError, refetch, userById } = useDemo();
  const jobs = state?.jobs ?? [];
  const waitingOnSuccess = jobs
    .filter((job) => job.status === "accepted" || job.status === "arrived")
    .reduce((total, job) => total + job.platformFee, 0);
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const noFeeJobs = jobs.filter((job) => ["declined", "cancelled", "failed"].includes(job.status));
  const orderedJobs = [...jobs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

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

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Fee summary">
        <SummaryCard
          label="Fees earned"
          value={aed(state.summary.totalFees)}
          detail="Successful jumps only"
          icon={<Wallet className="h-4 w-4" />}
          testId="text-fees-earned"
        />
        <SummaryCard
          label="Pending fee"
          value={aed(waitingOnSuccess)}
          detail="Accepted jobs; not earned"
          icon={<Clock3 className="h-4 w-4" />}
          testId="text-fees-pending"
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
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 id="fee-ledger-heading" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Job fee ledger</h2>
            <p className="mt-1 text-xs text-muted-foreground">The fee is 10% of the helper’s agreed quote. It is counted as earned only after a successful start.</p>
          </div>
          <Link href="/activity" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline" data-testid="link-admin-activity">
            Activity <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {orderedJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center" data-testid="admin-empty-ledger">
            <Receipt className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">No requests yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Demo fees will appear here when drivers request help.</p>
            <Button asChild className="mt-4 rounded-full"><Link href="/">Open the map</Link></Button>
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
