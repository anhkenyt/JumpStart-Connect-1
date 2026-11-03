import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/shell";
import { SafetyNote } from "@/components/bits";
import { useDemo, aed } from "@/lib/demo";

const DRIVER = [
  ["Drop your pin", "Use GPS or tap the map where your car is. Add a note so they can find you."],
  ["Pick a neighbor", "See who's available nearby with a jump pack or a car and cables, sorted by approximate distance, each with their own quote."],
  ["Wait for acceptance", "Your helper accepts explicitly. Nothing is charged while you wait."],
  ["Confirm it started", "After they arrive, only you can confirm the car started. That's the only moment you pay."],
];
const HELPER = [
  ["List what you bring", "A charged jump pack, or your running car plus cables. A car alone can't help."],
  ["Set your quote", "Your price in AED is what the driver sees and pays."],
  ["Accept or decline", "You see the full price, fee and payout before you say yes."],
  ["Arrive and boost", "Mark arrived, help safely, and get paid when the driver confirms."],
];

export default function HowPage() {
  const { state } = useDemo();
  const pct = state?.summary.feePercent ?? 10;
  return (
    <Page>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
      <h1 className="font-display mt-1 text-4xl font-extrabold leading-[1.05] md:text-5xl">Flat battery, friendly neighbor, back on the road.</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Jumpstart connects drivers with people nearby who carry the gear to give a boost. Simple quote, pay only if it works.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {([["If your battery's dead", DRIVER, "bg-accent"], ["If you can help", HELPER, "bg-secondary"]] as const).map(([t, steps, tone]) => (
          <section key={t} className="rounded-2xl border border-card-border bg-card p-5">
            <h2 className="font-display text-xl font-bold">{t}</h2>
            <ol className="mt-4 space-y-4">
              {steps.map(([h, d], i) => (
                <li key={h} className="flex gap-3">
                  <span className={`font-num grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-semibold ${tone}`}>{i + 1}</span>
                  <div><p className="font-semibold">{h}</p><p className="text-sm text-muted-foreground">{d}</p></div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-2xl bg-[hsl(200_32%_14%)] p-6 text-[hsl(40_40%_96%)]">
        <h2 className="font-display text-2xl font-bold">The success-only fee</h2>
        <p className="mt-2 max-w-xl text-sm opacity-80">Drivers pay exactly the helper's quote, nothing added. Jumpstart keeps {pct}% from the helper's payout, and only when the car starts. Declined, cancelled or unsuccessful jobs cost nobody anything.</p>
        <div className="font-num mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs opacity-70">Driver pays</p><p className="text-lg font-semibold">{aed(45)}</p></div>
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs opacity-70">Fee ({pct}%)</p><p className="text-lg font-semibold">{aed(45 * pct / 100)}</p></div>
          <div className="rounded-xl bg-primary p-3 text-primary-foreground"><p className="text-xs opacity-80">Helper gets</p><p className="text-lg font-semibold">{aed(45 - 45 * pct / 100)}</p></div>
        </div>
        <p className="mt-3 text-xs opacity-60">Example quote. Fee and prices are editable demo defaults.</p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="font-display text-xl font-bold">Roadside safety</h2>
        <SafetyNote />
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Pull fully off the road, hazards on, and wait behind a barrier if you can.</li>
          <li>Never jump a leaking, cracked or frozen battery. Follow your vehicle's manual.</li>
          <li>Connect red to red, black to a bare metal ground. Keep clamps from touching.</li>
          <li>Trust your gut. Cancel at any time, at no cost.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-border p-5 text-sm">
        <h2 className="font-semibold">About this demo</h2>
        <p className="mt-1 text-muted-foreground">The five users are fake test identities you can switch between from the top-right menu; there's no real login. Payments are simulated, so no real money is ever charged. Ratings and help counts are seeded demo data, not real reviews, and no one is ID-verified.</p>
        <Button asChild className="mt-4 rounded-full" data-testid="button-try-it"><Link href="/">Try finding help</Link></Button>
      </section>
    </Page>
  );
}
