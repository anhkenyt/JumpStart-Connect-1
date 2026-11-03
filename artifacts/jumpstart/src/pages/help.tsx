import { useEffect, useRef, useState } from "react";
import { Cable, Inbox, Zap } from "lucide-react";
import { useUpdateDemoUser, type DemoUserEquipment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Page } from "@/components/shell";
import { MapView } from "@/components/map-view";
import { JobCard } from "@/components/job-card";
import { Breakdown, SafetyNote, Skel, TestPill } from "@/components/bits";
import { useDemo, errMsg, feeFor, isActive } from "@/lib/demo";
import { useGps } from "@/lib/geo";
import { ErrorBox } from "@/pages/find";

export default function HelpPage() {
  const { state, me, userId, invalidate, isLoading, isError, refetch } = useDemo();
  const { toast } = useToast();
  const update = useUpdateDemoUser();
  const [form, setForm] = useState({ vehicle: "", price: "40", equipment: "jumper_cables" as DemoUserEquipment, lat: 0, lng: 0, locationLabel: "" });
  const initFor = useRef<string | null>(null);

  useEffect(() => {
    if (me && initFor.current !== me.id) {
      initFor.current = me.id;
      setForm({ vehicle: me.vehicle, price: String(me.price), equipment: me.equipment, lat: me.lat, lng: me.lng, locationLabel: me.locationLabel });
    }
  }, [me]);

  const gps = useGps((lat, lng) => setForm((f) => ({ ...f, lat, lng, locationLabel: "My GPS location" })));
  const pct = state?.summary.feePercent ?? 10;
  const priceN = Number(form.price);
  const priceOk = Number.isFinite(priceN) && priceN >= 10 && priceN <= 500;
  const incoming = (state?.jobs ?? []).filter((j) => j.helperId === userId && isActive(j)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const save = (data: Parameters<typeof update.mutate>[0]["data"], msg: string) =>
    update.mutate({ id: userId, data }, {
      onSuccess: () => { invalidate(); toast({ title: msg }); },
      onError: (e) => toast({ title: "Couldn't save", description: errMsg(e), variant: "destructive" }),
    });

  if (isError) return <Page><ErrorBox onRetry={refetch} /></Page>;
  if (isLoading || !me) return <Page><Skel className="h-10 w-60" /><Skel className="mt-6 h-40" /><Skel className="mt-4 h-72" /></Page>;

  const f = feeFor(priceOk ? priceN : 0, pct);
  return (
    <Page>
      <h1 className="font-display text-3xl font-bold">Help a neighbor</h1>
      <p className="mt-1 text-muted-foreground">Have cables and a running car, or a charged jump pack? Set your quote and you'll appear on the map.</p>

      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground"><Inbox className="h-4 w-4" /> Requests for you</h2>
        {incoming.length ? <div className="space-y-3">{incoming.map((j) => <JobCard key={j.id} job={j} />)}</div> : (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground" data-testid="empty-incoming">No incoming requests. {me.available ? "You're visible to nearby drivers." : "Turn on availability to be found."}</p>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-card-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-display text-lg font-bold">{me.available ? "You're available" : "You're offline"}</p>
            <p className="text-sm text-muted-foreground">{me.available ? "Drivers nearby can see your pin and quote." : "Hidden from the map. Turn on when you can help."}</p>
          </div>
          <Switch data-testid="switch-available" checked={me.available} disabled={update.isPending} onCheckedChange={(v) => save({ available: v }, v ? "You're now visible to drivers" : "You're offline")} />
        </div>
      </section>

      <section className="mt-4 space-y-5 rounded-2xl border border-card-border bg-card p-5">
        <div>
          <p className="mb-2 text-sm font-semibold">What do you bring?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {([["jumper_cables", "Car + jumper cables", Cable, "Your running car and a set of cables"], ["jump_pack", "Portable jump pack", Zap, "A charged lithium booster pack"]] as const).map(([v, l, Icon, d]) => (
              <button key={v} data-testid={`option-equipment-${v}`} onClick={() => setForm({ ...form, equipment: v })}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${form.equipment === v ? "border-primary bg-accent/60" : "border-border hover:bg-muted"}`}>
                <Icon className="mt-0.5 h-5 w-5 text-primary" />
                <span><span className="block font-semibold">{l}</span><span className="text-xs text-muted-foreground">{d}</span></span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">A car without cables can't help. One of these is required to be listed.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Vehicle
            <Input data-testid="input-vehicle" className="mt-1.5" maxLength={100} value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Your quote (AED)
            <Input data-testid="input-price" className="font-num mt-1.5" type="number" min={10} max={500} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            {!priceOk && <span className="mt-1 block text-xs font-normal text-destructive">Between AED 10 and 500.</span>}
          </label>
        </div>
        {priceOk && <Breakdown price={priceN} fee={f.fee} payout={f.payout} pct={pct} perspective="helper" />}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Where you're waiting</p>
            <Button data-testid="button-helper-gps" size="sm" variant="outline" className="rounded-full" onClick={gps.locate} disabled={gps.locating}>{gps.locating ? "Locating..." : "Use my GPS"}</Button>
          </div>
          <MapView className="h-56 overflow-hidden rounded-xl" center={[form.lat, form.lng]} onPick={(lat, lng) => setForm({ ...form, lat, lng, locationLabel: form.locationLabel || "Pinned spot" })} />
          {gps.error && <p className="mt-2 rounded-lg bg-accent p-2 text-xs text-accent-foreground">{gps.error}</p>}
          <Input data-testid="input-helper-location" className="mt-2" maxLength={160} value={form.locationLabel} onChange={(e) => setForm({ ...form, locationLabel: e.target.value })} placeholder="Label, e.g. Burj Vista parking" />
          <p className="mt-1 text-xs text-muted-foreground">Tap the map to move your pin. <span className="font-num">{form.lat.toFixed(4)}, {form.lng.toFixed(4)}</span></p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <TestPill>Editable demo defaults</TestPill>
          <Button data-testid="button-save-helper" className="rounded-full px-6" disabled={!priceOk || !form.vehicle.trim() || !form.locationLabel.trim() || update.isPending}
            onClick={() => save({ vehicle: form.vehicle.trim(), price: priceN, equipment: form.equipment, lat: form.lat, lng: form.lng, locationLabel: form.locationLabel.trim() }, "Helper profile saved")}>
            {update.isPending ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </section>
      <div className="mt-4"><SafetyNote /></div>
    </Page>
  );
}
