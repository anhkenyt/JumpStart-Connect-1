import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import type { DemoUser } from "@workspace/api-client-react";
import { aed } from "@/lib/demo";

export function UserDot({ user, size = 36 }: { user?: DemoUser; size?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full font-bold text-[hsl(40_40%_99%)]"
      style={{ width: size, height: size, background: user?.color ?? "hsl(200 12% 60%)", fontSize: size * 0.36 }}
    >
      {user?.initials ?? "?"}
    </span>
  );
}

export function TestPill({ children = "Test payment" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-[hsl(22_70%_60%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
      {children}
    </span>
  );
}

export function Breakdown({ price, fee, payout, pct, perspective }: { price: number; fee: number; payout: number; pct: number; perspective?: "driver" | "helper" }) {
  const row = "flex items-baseline justify-between py-1.5";
  return (
    <div className="rounded-xl bg-muted/70 px-4 py-2 text-sm" data-testid="breakdown">
      <div className={row}>
        <span className={perspective === "driver" ? "font-semibold" : "text-muted-foreground"}>Driver pays (helper's quote)</span>
        <span className="font-num font-semibold" data-testid="text-price">{aed(price)}</span>
      </div>
      <div className={`${row} border-t border-dashed border-border`}>
        <span className="text-muted-foreground">Jumpstart fee ({pct}%, from helper payout)</span>
        <span className="font-num text-muted-foreground" data-testid="text-fee">-{aed(fee)}</span>
      </div>
      <div className={`${row} border-t border-border`}>
        <span className={perspective === "helper" ? "font-semibold" : "text-muted-foreground"}>Helper receives</span>
        <span className="font-num font-semibold text-[hsl(188_62%_26%)]" data-testid="text-payout">{aed(payout)}</span>
      </div>
      <p className="pb-1 pt-1 text-[11px] text-muted-foreground">Charged only if the car starts. Demo mode: no real money moves.</p>
    </div>
  );
}

export function SafetyNote({ compact }: { compact?: boolean }) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-[hsl(44_70%_80%)] bg-[hsl(44_90%_95%)] p-3 text-[12.5px] leading-snug text-[hsl(30_50%_25%)]">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        Only meet somewhere safe and off the traffic lane. Jumpstart is not an emergency service.
        {!compact && " If you or anyone is in danger, "}
        {compact ? " In danger? " : ""}
        <strong>call 999 (UAE police) or local emergency services.</strong>
      </p>
    </div>
  );
}

export function Skel({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}
