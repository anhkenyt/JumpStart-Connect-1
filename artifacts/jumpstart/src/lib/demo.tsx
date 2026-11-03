import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetJumpstartState,
  getGetJumpstartStateQueryKey,
  getGetNearbyHelpersQueryKey,
  type DemoUser,
  type JumpstartJob,
  type JumpstartState,
} from "@workspace/api-client-react";

export const DEFAULT_USER = "user-1";
export const DEMO_CENTER = { lat: 25.1972, lng: 55.2744, label: "Downtown Dubai (demo location)" };
const KEY = "jumpstart.demoUser";

export const ACTIVE = ["pending", "accepted", "arrived"] as const;
export const isActive = (j: JumpstartJob) => (ACTIVE as readonly string[]).includes(j.status);

type Ctx = {
  state: JumpstartState | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  userId: string;
  me: DemoUser | undefined;
  setUserId: (id: string) => void;
  userById: (id: string) => DemoUser | undefined;
  activeJob: JumpstartJob | undefined;
  invalidate: () => void;
};

const DemoCtx = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [userId, setUid] = useState<string>(() => localStorage.getItem(KEY) || DEFAULT_USER);
  const q = useGetJumpstartState({ query: { refetchInterval: 4000, queryKey: getGetJumpstartStateQueryKey() } });
  const state = q.data;

  const setUserId = useCallback((id: string) => {
    localStorage.setItem(KEY, id);
    setUid(id);
  }, []);

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: getGetJumpstartStateQueryKey() });
    qc.invalidateQueries({ queryKey: getGetNearbyHelpersQueryKey() });
  }, [qc]);

  const value = useMemo<Ctx>(() => {
    const users = state?.users ?? [];
    const me = users.find((u) => u.id === userId) ?? users[0];
    const activeJob = (state?.jobs ?? [])
      .filter((j) => isActive(j) && (j.requesterId === me?.id || j.helperId === me?.id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return {
      state,
      isLoading: q.isLoading,
      isError: q.isError,
      refetch: () => void q.refetch(),
      userId: me?.id ?? userId,
      me,
      setUserId,
      userById: (id) => users.find((u) => u.id === id),
      activeJob,
      invalidate,
    };
  }, [state, userId, q.isLoading, q.isError, q.refetch, setUserId, invalidate]);

  return <DemoCtx.Provider value={value}>{children}</DemoCtx.Provider>;
}

export function useDemo() {
  const c = useContext(DemoCtx);
  if (!c) throw new Error("useDemo outside provider");
  return c;
}

export function errMsg(e: unknown): string {
  const d = (e as { data?: unknown })?.data;
  if (d && typeof d === "object") {
    const o = d as Record<string, unknown>;
    if (typeof o.error === "string") return o.error;
    if (typeof o.message === "string") return o.message;
  }
  if (typeof d === "string" && d) return d;
  return e instanceof Error ? e.message : "Something went wrong. Please try again.";
}

export const aed = (n: number) => `AED ${n.toFixed(n % 1 ? 2 : 0)}`;

export function feeFor(price: number, pct: number) {
  const fee = Math.round(price * pct) / 100;
  return { fee, payout: Math.round((price - fee) * 100) / 100 };
}

export const equipLabel = (e: string) => (e === "jump_pack" ? "Portable jump pack" : "Car + jumper cables");

export function inDubai(lat: number, lng: number) {
  return lat > 24.6 && lat < 25.6 && lng > 54.8 && lng < 55.8;
}

export const STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Waiting for helper", tone: "bg-accent text-accent-foreground" },
  accepted: { label: "Helper on the way", tone: "bg-secondary text-secondary-foreground" },
  arrived: { label: "Helper arrived", tone: "bg-secondary text-secondary-foreground" },
  completed: { label: "Started, paid (test)", tone: "bg-[hsl(152_45%_90%)] text-[hsl(152_50%_24%)]" },
  failed: { label: "Didn't start, no charge", tone: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled, no charge", tone: "bg-muted text-muted-foreground" },
  declined: { label: "Declined, no charge", tone: "bg-muted text-muted-foreground" },
};
