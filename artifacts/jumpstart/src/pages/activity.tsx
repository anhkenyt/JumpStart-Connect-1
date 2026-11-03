import { Link } from "wouter";
import { format } from "date-fns";
import { Receipt, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/shell";
import { JobCard, StatusChip } from "@/components/job-card";
import { Skel, TestPill, UserDot } from "@/components/bits";
import { useDemo, isActive, aed } from "@/lib/demo";
import { ErrorBox } from "@/pages/find";

export default function ActivityPage() {
  const { state, userId, userById, isLoading, isError, refetch } = useDemo();
  const mine = (state?.jobs ?? []).filter((j) => j.requesterId === userId || j.helperId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const active = mine.filter(isActive);
  const past = mine.filter((j) => !isActive(j));

  return (
    <Page>
      <h1 className="font-display text-3xl font-bold">Activity</h1>
      <p className="mt-1 text-muted-foreground">Live requests and receipts for this demo identity. Updates every few seconds.</p>
      {isError ? <div className="mt-6"><ErrorBox onRetry={refetch} /></div> : isLoading ? (
        <div className="mt-6 space-y-3"><Skel className="h-60" /><Skel className="h-20" /></div>
      ) : (
        <>
          <section className="mt-6 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Right now</h2>
            {active.length ? active.map((j) => <JobCard key={j.id} job={j} />) : (
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border p-5" data-testid="empty-active">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary"><Search className="h-5 w-5 text-secondary-foreground" /></span>
                <div className="flex-1"><p className="font-semibold">Nothing in progress</p><p className="text-sm text-muted-foreground">When you request or accept a jump, it shows up here.</p></div>
                <Button asChild className="rounded-full" data-testid="button-find-help"><Link href="/">Find help</Link></Button>
              </div>
            )}
          </section>
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Past jobs and receipts</h2>
            {past.length === 0 ? <p className="text-sm text-muted-foreground" data-testid="empty-past">No finished jobs yet.</p> : (
              <ul className="space-y-3">
                {past.map((j) => {
                  const asHelper = j.helperId === userId;
                  const other = userById(asHelper ? j.requesterId : j.helperId);
                  const paid = j.paymentStatus === "simulated_paid";
                  return (
                    <li key={j.id} className="rounded-2xl border border-card-border bg-card p-4" data-testid={`receipt-${j.id}`}>
                      <div className="flex items-center gap-3">
                        <UserDot user={other} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{asHelper ? `Helped ${other?.name}` : `Helped by ${other?.name}`}</p>
                          <p className="truncate text-xs text-muted-foreground">{format(new Date(j.updatedAt), "d MMM yyyy, HH:mm")} · {j.locationLabel}</p>
                        </div>
                        <StatusChip status={j.status} />
                      </div>
                      <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm">
                        <div className="mb-1 flex items-center justify-between"><span className="flex items-center gap-1.5 font-semibold"><Receipt className="h-4 w-4" /> Receipt #{j.id.slice(-6)}</span><TestPill>{paid ? "Test payment, no real money" : "Not charged"}</TestPill></div>
                        {paid ? (
                          <div className="font-num space-y-0.5 text-[13px]">
                            <Row k="Driver paid" v={aed(j.price)} />
                            <Row k="Jumpstart fee (from helper)" v={`-${aed(j.platformFee)}`} />
                            <Row k="Helper payout" v={aed(j.helperEarnings)} strong />
                          </div>
                        ) : <p className="text-muted-foreground">Quote was {aed(j.price)}. Unsuccessful or cancelled jobs cost nothing for anyone.</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </Page>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return <div className={`flex justify-between ${strong ? "font-semibold" : "text-muted-foreground"}`}><span className="font-sans">{k}</span><span>{v}</span></div>;
}
