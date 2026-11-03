import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { AlertCircle, BatteryWarning, Cable, ChevronRight, MapPin, MousePointerClick, RotateCcw, Star, Zap } from "lucide-react";
import { useGetNearbyHelpers, getGetNearbyHelpersQueryKey, useCreateJumpstartJob, type NearbyHelper } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MapView } from "@/components/map-view";
import { JobCard } from "@/components/job-card";
import { Breakdown, SafetyNote, Skel, TestPill, UserDot } from "@/components/bits";
import { useDemo, DEMO_CENTER, errMsg, feeFor, aed, equipLabel, inDubai } from "@/lib/demo";
import { useGps } from "@/lib/geo";

type Loc = { lat: number; lng: number; label: string; source: "demo" | "gps" | "map" | "saved" };

export default function FindPage() {
  const { state, me, userId, activeJob, invalidate, isLoading, isError, refetch } = useDemo();
  const { toast } = useToast();
  const [loc, setLoc] = useState<Loc>({ ...DEMO_CENTER, source: "demo" });
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<NearbyHelper | null>(null);
  const [safe, setSafe] = useState(false);
  const initFor = useRef<string | null>(null);

  useEffect(() => {
    if (me && initFor.current !== me.id) {
      initFor.current = me.id;
      const isDefault = me.id === "user-1" && me.lat === DEMO_CENTER.lat && me.lng === DEMO_CENTER.lng && me.locationLabel === "Downtown Dubai";
      setLoc({ lat: me.lat, lng: me.lng, label: isDefault ? DEMO_CENTER.label : me.locationLabel, source: isDefault ? "demo" : "saved" });
      setSelected(null);
      setConfirm(null);
      setSafe(false);
      setNotes("");
    }
  }, [me]);

  const gps = useGps((lat, lng) => {
    setLoc({ lat, lng, label: "My current GPS location", source: "gps" });
    toast({ title: "Using your GPS location" });
  });

  const params = { userId, lat: Number(loc.lat.toFixed(5)), lng: Number(loc.lng.toFixed(5)), radius: 25 };
  const nearby = useGetNearbyHelpers(params, {
    query: { enabled: !!state, refetchInterval: 4000, queryKey: getGetNearbyHelpersQueryKey(params) },
  });
  const helpers = nearby.data ?? [];
  const create = useCreateJumpstartJob();
  const pct = state?.summary.feePercent ?? 10;
  const myRequest = activeJob && activeJob.requesterId === userId ? activeJob : undefined;
  const helpingNow = activeJob && activeJob.helperId === userId ? activeJob : undefined;

  const pins = useMemo(() => helpers.map((h) => ({ user: h.user, selected: h.user.id === selected })), [helpers, selected]);
  const assignedHelper = myRequest ? state?.users.find((user) => user.id === myRequest.helperId) : undefined;

  const pick = (lat: number, lng: number) => {
    if (myRequest) return;
    setLoc({ lat, lng, label: "Pinned spot on map", source: "map" });
  };
  const resetDemo = () => { gps.clearError(); setLoc({ ...DEMO_CENTER, source: "demo" }); };

  const submit = () => {
    if (!confirm) return;
    create.mutate(
      { data: { requesterId: userId, helperId: confirm.user.id, lat: loc.lat, lng: loc.lng, locationLabel: loc.label.trim() || "Pinned spot", notes: notes.trim() || undefined, agreedPrice: confirm.user.price } },
      {
        onSuccess: () => { invalidate(); setConfirm(null); setSafe(false); toast({ title: "Request sent", description: `${confirm.user.name} needs to accept. No charge yet.` }); },
        onError: (e) => toast({ title: "Couldn't send request", description: errMsg(e), variant: "destructive" }),
      },
    );
  };

  const center: [number, number] = myRequest ? [myRequest.lat, myRequest.lng] : [loc.lat, loc.lng];
  const outside = !inDubai(loc.lat, loc.lng);

  return (
    <div className="flex h-full flex-col md:block">
      <MapView
        className="h-[44dvh] shrink-0 md:absolute md:inset-0 md:h-full"
        center={center}
        pins={myRequest ? (assignedHelper ? [{ user: assignedHelper, selected: true }] : []) : pins}
        onSelect={(id) => setSelected(id)}
        onPick={pick}
        onLocate={myRequest ? undefined : gps.locate}
        locating={gps.locating}
      />

      <aside className="relative z-10 -mt-4 min-h-0 flex-1 overflow-y-auto rounded-t-3xl bg-background shadow-float md:absolute md:left-4 md:top-4 md:mt-0 md:max-h-[calc(100%-2rem)] md:w-[400px] md:flex-none md:rounded-2xl">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border md:hidden" />
        <div className="space-y-4 p-4">
          {isError ? (
            <ErrorBox onRetry={refetch} />
          ) : isLoading || !me ? (
            <div className="space-y-3"><Skel className="h-24" /><Skel className="h-16" /><Skel className="h-16" /><Skel className="h-16" /></div>
          ) : myRequest ? (
            <>
              <h1 className="font-display text-2xl font-bold">Help is lined up</h1>
              <JobCard job={myRequest} />
              <SafetyNote compact />
            </>
          ) : (
            <>
              {helpingNow && (
                <Link href="/help" className="flex items-center gap-3 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground" data-testid="link-helping-now">
                  <Zap className="h-4 w-4" /> <span className="flex-1">You have a job as a helper right now.</span> <ChevronRight className="h-4 w-4" />
                </Link>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Hi {me.name.split(" ")[0]}, battery flat?</p>
                <h1 className="font-display text-[26px] font-bold leading-tight">Find a neighbor with a boost</h1>
              </div>

              <div className="rounded-2xl border border-card-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[hsl(188_62%_30%)]" />
                  <Input data-testid="input-location-label" value={loc.label} maxLength={160} onChange={(e) => setLoc({ ...loc, label: e.target.value })}
                    className="h-9 border-0 bg-transparent px-1 font-semibold shadow-none focus-visible:ring-1" aria-label="Location label" />
                </div>
                <p className="mt-1 flex items-center gap-1.5 pl-6 text-[11.5px] text-muted-foreground">
                  <MousePointerClick className="h-3 w-3" />
                  {loc.source === "demo" ? "Demo location. " : loc.source === "gps" ? "From your device GPS. " : loc.source === "saved" ? "Saved location. " : "Pinned on the map. "}
                  Tap the map to move the pin.
                  <span className="font-num">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                </p>
                <Textarea data-testid="input-notes" value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes for the helper: car colour, parking level, landmark..." className="mt-2 min-h-[60px] resize-none bg-muted/50 text-sm" />
                <div className="mt-2 flex gap-2">
                  <Button data-testid="button-use-gps" size="sm" variant="outline" className="rounded-full" onClick={gps.locate} disabled={gps.locating}>
                    {gps.locating ? "Locating..." : "Use my GPS"}
                  </Button>
                  {loc.source !== "demo" && (
                    <Button data-testid="button-reset-demo" size="sm" variant="ghost" className="rounded-full" onClick={resetDemo}><RotateCcw className="mr-1 h-3.5 w-3.5" /> Demo location</Button>
                  )}
                </div>
                {gps.error && <p className="mt-2 flex gap-2 rounded-lg bg-accent p-2 text-xs text-accent-foreground" data-testid="text-gps-error"><AlertCircle className="h-4 w-4 shrink-0" />{gps.error}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="font-semibold">Available nearby</h2>
                  <span className="text-[11px] text-muted-foreground">Distance and ETA are approximate</span>
                </div>
                {nearby.isLoading ? (
                  <div className="space-y-2"><Skel className="h-20" /><Skel className="h-20" /></div>
                ) : nearby.isError ? (
                  <ErrorBox onRetry={() => nearby.refetch()} />
                ) : helpers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-5 text-center" data-testid="empty-helpers">
                    <BatteryWarning className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 font-semibold">{outside ? "No demo helpers near you" : "Nobody available right now"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {outside ? "All five demo helpers live around Downtown Dubai. We won't pretend they're next to you." : "Helpers may be busy or offline. Switch to a demo user and turn on helping, or try again shortly."}
                    </p>
                    {outside && <Button data-testid="button-use-demo-location" className="mt-3 rounded-full" onClick={resetDemo}>Use demo location</Button>}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {helpers.map((h, i) => {
                      const sel = h.user.id === selected;
                      return (
                        <li key={h.user.id} style={{ animationDelay: `${i * 50}ms` }} className="rise">
                          <button data-testid={`card-helper-${h.user.id}`} onClick={() => setSelected(sel ? null : h.user.id)}
                            className={`w-full rounded-2xl border bg-card p-3 text-left transition ${sel ? "border-primary ring-2 ring-primary/20" : "border-card-border hover:border-input"}`}>
                            <div className="flex items-center gap-3">
                              <UserDot user={h.user} size={40} />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold">{h.user.name}</p>
                                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                  {h.user.equipment === "jump_pack" ? <Zap className="h-3 w-3" /> : <Cable className="h-3 w-3" />}
                                  {equipLabel(h.user.equipment)} · {h.user.vehicle}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-num font-semibold">{aed(h.user.price)}</p>
                                <p className="text-[11px] text-muted-foreground">~{h.distanceKm.toFixed(1)} km · ~{h.estimatedMinutes} min</p>
                              </div>
                            </div>
                            {sel && (
                              <div className="mt-3 border-t border-border pt-3">
                                <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3" /> {h.user.rating.toFixed(1)} · {h.user.completedHelps} helps <span className="opacity-70">(seeded demo data, not real reviews)</span>
                                </p>
                                <span data-testid={`button-request-${h.user.id}`} role="button" tabIndex={0}
                                  onClick={(e) => { e.stopPropagation(); setConfirm(h); }}
                                  onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setConfirm(h); } }}
                                  className="flex h-10 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition active:scale-[.98]">
                                  Request {h.user.name.split(" ")[0]} for {aed(h.user.price)}
                                </span>
                              </div>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <SafetyNote compact />
            </>
          )}
        </div>
      </aside>

      <Dialog open={!!confirm} onOpenChange={(o) => { if (!o) { setConfirm(null); setSafe(false); } }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {confirm && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Request {confirm.user.name}?</DialogTitle>
                <DialogDescription>Price is {confirm.user.name.split(" ")[0]}'s listed quote. Nothing is charged unless your car starts.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <UserDot user={confirm.user} />
                  <div className="flex-1">
                    <p className="font-semibold">{equipLabel(confirm.user.equipment)}</p>
                    <p className="text-xs text-muted-foreground">~{confirm.distanceKm.toFixed(1)} km away · approx. {confirm.estimatedMinutes} min</p>
                  </div>
                  <TestPill />
                </div>
                <p className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm"><MapPin className="h-4 w-4" /> {loc.label}</p>
                {(() => { const f = feeFor(confirm.user.price, pct); return <Breakdown price={confirm.user.price} fee={f.fee} payout={f.payout} pct={pct} perspective="driver" />; })()}
                <SafetyNote />
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox data-testid="checkbox-safe" checked={safe} onCheckedChange={(v) => setSafe(v === true)} className="mt-0.5" />
                  I'm parked somewhere safe, out of moving traffic.
                </label>
                <Button data-testid="button-confirm-request" className="h-11 w-full rounded-full" disabled={!safe || create.isPending} onClick={submit}>
                  {create.isPending ? "Sending..." : `Send request · ${aed(confirm.user.price)} on success`}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm" data-testid="error-box">
      <p className="font-semibold text-destructive">We couldn't reach Jumpstart.</p>
      <p className="mt-1 text-muted-foreground">Check your connection, then try again.</p>
      <Button data-testid="button-retry" size="sm" variant="outline" className="mt-3 rounded-full" onClick={onRetry}>Retry</Button>
    </div>
  );
}
