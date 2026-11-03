import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, BatteryCharging, ChevronDown, HandHelping, Info, Map as MapIcon } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDemo } from "@/lib/demo";
import { UserDot } from "@/components/bits";

const NAV = [
  { href: "/", label: "Find help", icon: MapIcon },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/help", label: "Help others", icon: HandHelping },
  { href: "/how-it-works", label: "How it works", icon: Info },
];

export function UserSwitcher() {
  const { state, me, setUserId, userId } = useDemo();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-testid="button-user-switcher" className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 transition hover:bg-muted">
        <UserDot user={me} size={30} />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Demo identity</span>
          <span className="block text-sm font-semibold" data-testid="text-current-user">{me?.name ?? "Loading"}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-xl p-1.5">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Switch fake test user. No login, no real accounts.</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(state?.users ?? []).map((u) => (
          <DropdownMenuItem key={u.id} data-testid={`menu-user-${u.id}`} onClick={() => setUserId(u.id)} className="gap-3 rounded-lg py-2">
            <UserDot user={u} size={32} />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{u.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{u.available ? `Helping · AED ${u.price}` : "Not helping now"} · {u.vehicle}</span>
            </span>
            {u.id === userId && <span className="h-2 w-2 rounded-full bg-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const { activeJob } = useDemo();
  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-3 backdrop-blur md:px-5">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><BatteryCharging className="h-4.5 w-4.5" /></span>
          <span className="font-display text-xl font-extrabold">Jumpstart</span>
        </Link>
        <span className="hidden rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground sm:inline">Demo · test payments</span>
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const on = loc === n.href;
            return (
              <Link key={n.href} href={n.href} data-testid={`link-nav-${n.label.toLowerCase().replace(/ /g, "-")}`}
                className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition ${on ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {n.label}
                {n.href === "/activity" && activeJob && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto"><UserSwitcher /></div>
      </header>
      <main className="relative min-h-0 flex-1 overflow-hidden">{children}</main>
      <nav className="z-20 grid shrink-0 grid-cols-4 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map((n) => {
          const on = loc === n.href;
          return (
            <Link key={n.href} href={n.href} className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${on ? "text-primary" : "text-muted-foreground"}`}>
              <n.icon className="h-5 w-5" />
              {n.label}
              {n.href === "/activity" && activeJob && <span className="absolute right-[30%] top-1.5 h-2 w-2 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="h-full overflow-y-auto"><div className="mx-auto max-w-3xl px-4 py-6 md:py-10">{children}</div></div>;
}
