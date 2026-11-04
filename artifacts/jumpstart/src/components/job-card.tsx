import { Link } from "wouter";
import { Check, Clock, MapPin, Navigation, Repeat, X } from "lucide-react";
import { useActOnJumpstartJob, type JumpstartJob, type JobActionInputAction } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDemo, errMsg, STATUS, aed } from "@/lib/demo";
import { Breakdown, TestPill, UserDot } from "@/components/bits";

const STEPS = ["pending", "accepted", "arrived", "completed"] as const;

export function StatusChip({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: "bg-muted" };
  return <span data-testid={`status-${status}`} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.tone}`}>{s.label}</span>;
}

export function JobCard({ job }: { job: JumpstartJob }) {
  const { userId, userById, setUserId, invalidate, state } = useDemo();
  const { toast } = useToast();
  const act = useActOnJumpstartJob();
  const requester = userById(job.requesterId);
  const helper = userById(job.helperId);
  const amRequester = userId === job.requesterId;
  const amHelper = userId === job.helperId;
  const other = amRequester ? helper : requester;
  const step = STEPS.indexOf(job.status as (typeof STEPS)[number]);
  const pct = state?.summary.feePercent ?? 10;

  const run = (action: JobActionInputAction, ok: string) =>
    act.mutate(
      { id: job.id, data: { actorId: userId, action } },
      { onSuccess: () => { invalidate(); toast({ title: ok }); }, onError: (e) => toast({ title: "Couldn't update", description: errMsg(e), variant: "destructive" }) },
    );
  const busy = act.isPending;

  return (
    <div className="rise overflow-hidden rounded-2xl border border-card-border bg-card shadow-float" data-testid={`card-job-${job.id}`}>
      <div className="flex items-center gap-3 p-4">
        <UserDot user={other} size={42} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{amRequester ? "Your helper" : amHelper ? "Driver needing a jump" : "Job"}</p>
          <p className="font-display truncate text-lg font-bold">{other?.name ?? "Unknown"}</p>
        </div>
        <StatusChip status={job.status} />
      </div>

      <div className="flex gap-1 px-4">
        {STEPS.map((s, i) => (
          <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full origin-left rounded-full bg-primary transition-transform duration-700" style={{ transform: `scaleX(${i <= step ? 1 : 0})` }} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 px-4 pt-1.5 text-[10.5px] text-muted-foreground">
        <span>Requested</span><span>Accepted</span><span>Arrived</span><span className="text-right">Started</span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(188_62%_30%)]" />
          <div>
            <p className="font-medium">{job.locationLabel}</p>
            {job.notes && <p className="text-muted-foreground">"{job.notes}"</p>}
          </div>
        </div>
        {helper && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {helper.name} brings a {helper.equipment === "jump_pack" ? "portable jump pack" : `${helper.vehicle} with cables`}
          </p>
        )}
        <Breakdown price={job.price} fee={job.platformFee} payout={job.helperEarnings} pct={pct} perspective={amHelper ? "helper" : "driver"} />

        {job.status === "pending" && amRequester && (
          <div className="rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
            <p className="font-semibold">Waiting for {helper?.name.split(" ")[0]} to accept.</p>
            <p className="mt-0.5 text-xs opacity-80">Demo tip: nobody auto-accepts. Switch to the helper's identity to accept it yourself.</p>
            <Button data-testid="button-switch-to-helper" size="sm" variant="outline" className="mt-2 rounded-full bg-card" asChild>
              <Link href="/help" onClick={() => setUserId(job.helperId)}><Repeat className="mr-1.5 h-3.5 w-3.5" /> Switch to {helper?.name ?? "helper"}</Link>
            </Button>
          </div>
        )}
        {amHelper && job.status !== "pending" && (job.status === "accepted" || job.status === "arrived") && (
          <Button data-testid="button-switch-to-driver" size="sm" variant="ghost" className="rounded-full" asChild>
            <Link href="/activity" onClick={() => setUserId(job.requesterId)}><Repeat className="mr-1.5 h-3.5 w-3.5" /> Switch to driver {requester?.name}</Link>
          </Button>
        )}
        {job.status === "arrived" && amHelper && (
          <p className="text-xs text-muted-foreground">If the jump worked, finish the demo job here. This records a simulated payment only.</p>
        )}

        <div className="flex flex-wrap gap-2">
          {amHelper && job.status === "pending" && (
            <>
              <Button data-testid="button-accept" disabled={busy} className="flex-1 rounded-full" onClick={() => run("accept", "Accepted. Head over safely.")}>
                <Check className="mr-1.5 h-4 w-4" /> Accept for {aed(job.price)}
              </Button>
              <Button data-testid="button-decline" disabled={busy} variant="outline" className="rounded-full" onClick={() => run("decline", "Declined. No charge to anyone.")}>Decline</Button>
            </>
          )}
          {amHelper && job.status === "accepted" && (
            <>
              <Button data-testid="button-arrive" disabled={busy} className="flex-1 rounded-full" onClick={() => run("arrive", "Marked as arrived")}>
                <Navigation className="mr-1.5 h-4 w-4" /> I've arrived
              </Button>
              <Button data-testid="button-helper-cancel" disabled={busy} variant="outline" className="rounded-full" onClick={() => run("cancel", "Cancelled. No charge.")}>Can't make it</Button>
            </>
          )}
          {amHelper && job.status === "arrived" && (
            <Button
              data-testid="button-helper-complete"
              disabled={busy}
              className="flex-1 rounded-full"
              onClick={() => run("complete", "Jump-start successful. Test payment recorded.")}
            >
              <Check className="mr-1.5 h-4 w-4" /> Finish successfully
            </Button>
          )}
          {amRequester && job.status === "arrived" && (
            <>
              <Button data-testid="button-complete" disabled={busy} className="flex-1 rounded-full" onClick={() => run("complete", "Car started. Test payment recorded.")}>
                <Check className="mr-1.5 h-4 w-4" /> Car started, pay {aed(job.price)}
              </Button>
              <Button data-testid="button-fail" disabled={busy} variant="outline" className="rounded-full" onClick={() => run("fail", "Marked unsuccessful. No charge.")}>Didn't start</Button>
            </>
          )}
          {amRequester && (job.status === "pending" || job.status === "accepted") && (
            <Button data-testid="button-cancel" disabled={busy} variant="ghost" className="rounded-full text-destructive" onClick={() => run("cancel", "Request cancelled. No charge.")}>
              <X className="mr-1 h-4 w-4" /> Cancel request
            </Button>
          )}
        </div>
        <div className="flex justify-end"><TestPill /></div>
      </div>
    </div>
  );
}
