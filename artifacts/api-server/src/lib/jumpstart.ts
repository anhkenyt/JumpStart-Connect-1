import { randomUUID } from "node:crypto";
import { pool } from "@workspace/db";
import {
  GetJumpstartStateResponse,
  CreateJumpstartJobBody,
  ActOnJumpstartJobBody,
} from "@workspace/api-zod";

type State = ReturnType<typeof GetJumpstartStateResponse.parse>;
export type DemoData = Pick<State, "users" | "jobs">;
type Job = State["jobs"][number];
type JobInput = ReturnType<typeof CreateJumpstartJobBody.parse>;
type ActionInput = ReturnType<typeof ActOnJumpstartJobBody.parse>;

export class DemoError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function initialDemoData(): DemoData {
  return {
    users: [
      { id: "user-1", name: "Alex Morgan", initials: "AM", color: "#3b73dc", vehicle: "Toyota Camry · White", equipment: "jumper_cables", available: false, lat: 25.1972, lng: 55.2744, locationLabel: "Downtown Dubai", price: 60, rating: 4.9, completedHelps: 0 },
      { id: "user-2", name: "Omar Hassan", initials: "OH", color: "#278568", vehicle: "Nissan Patrol · Silver", equipment: "jump_pack", available: true, lat: 25.1997, lng: 55.2793, locationLabel: "Dubai Mall, Downtown", price: 50, rating: 4.9, completedHelps: 32 },
      { id: "user-3", name: "Sarah Chen", initials: "SC", color: "#bf6d3b", vehicle: "Honda CR-V · Blue", equipment: "jumper_cables", available: true, lat: 25.1905, lng: 55.2688, locationLabel: "Business Bay", price: 40, rating: 4.8, completedHelps: 18 },
      { id: "user-4", name: "James Wilson", initials: "JW", color: "#8065b0", vehicle: "Ford Explorer · Black", equipment: "jump_pack", available: true, lat: 25.2086, lng: 55.2667, locationLabel: "DIFC, Dubai", price: 65, rating: 5.0, completedHelps: 47 },
      { id: "user-5", name: "Aisha Ahmed", initials: "AA", color: "#ba5e7e", vehicle: "Hyundai Tucson · White", equipment: "jump_pack", available: true, lat: 25.1842, lng: 55.2856, locationLabel: "South Ridge, Dubai", price: 45, rating: 4.9, completedHelps: 24 },
    ],
    jobs: [],
  };
}

const activeStatuses = new Set(["pending", "accepted", "arrived"]);
export const isActive = (job: Job): boolean => activeStatuses.has(job.status);
export const isBusy = (data: DemoData, id: string): boolean =>
  data.jobs.some((job) => isActive(job) && (job.helperId === id || job.requesterId === id));

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = (degrees: number) => degrees * Math.PI / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

export function summarize(data: DemoData): State {
  const successful = data.jobs.filter((job) => job.status === "completed");
  return {
    ...data,
    summary: {
      availableHelpers: data.users.filter((user) => user.available && !isBusy(data, user.id)).length,
      successfulJobs: successful.length,
      totalFees: Math.round(successful.reduce((sum, job) => sum + job.platformFee, 0) * 100) / 100,
      currency: "AED",
      feePercent: 10,
      paymentMode: "test",
    },
  };
}

export async function readDemo(id: string): Promise<DemoData> {
  const result = await pool.query("SELECT data FROM jumpstart_demo_sessions WHERE id = $1", [id]);
  if (!result.rows[0]) throw new DemoError(404, "Demo session not found. Refresh to start a new demo.");
  return result.rows[0].data as DemoData;
}

// A row lock makes transitions and success-only receipts atomic even with
// simultaneous requests or double-clicks. No payment provider is called.
export async function changeDemo<T>(id: string, change: (data: DemoData) => T): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT data FROM jumpstart_demo_sessions WHERE id = $1 FOR UPDATE", [id]);
    if (!result.rows[0]) throw new DemoError(404, "Demo session not found.");
    const data = result.rows[0].data as DemoData;
    const output = change(data);
    await client.query("UPDATE jumpstart_demo_sessions SET data = $2::jsonb, updated_at = now() WHERE id = $1", [id, JSON.stringify(data)]);
    await client.query("COMMIT");
    return output;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function createJob(data: DemoData, input: JobInput): Job {
  const driver = data.users.find((user) => user.id === input.requesterId);
  const helper = data.users.find((user) => user.id === input.helperId);
  if (!driver || !helper) throw new DemoError(404, "Driver or helper not found.");
  if (driver.id === helper.id) throw new DemoError(400, "Choose a different person to help you.");
  if (!helper.available || isBusy(data, helper.id)) throw new DemoError(409, "This helper is no longer available. Please choose another helper.");
  if (isBusy(data, driver.id)) throw new DemoError(409, "You already have an active request. Finish or cancel it first.");
  if (input.agreedPrice !== helper.price) throw new DemoError(409, "The helper's price has changed. Refresh and agree to the current price.");
  if (distanceKm(input.lat, input.lng, helper.lat, helper.lng) > 100) {
    throw new DemoError(400, "This helper is more than 100 km away. Choose someone closer.");
  }
  if (!input.locationLabel.trim()) throw new DemoError(400, "Enter a location description.");
  if (data.jobs.length >= 1000) throw new DemoError(409, "This demo workspace has reached its request limit.");
  const fee = Math.round(helper.price * 10) / 100;
  const time = new Date().toISOString();
  const job: Job = {
    id: randomUUID(),
    requesterId: driver.id,
    helperId: helper.id,
    lat: input.lat,
    lng: input.lng,
    locationLabel: input.locationLabel.trim(),
    notes: input.notes?.trim() ?? "",
    status: "pending",
    price: helper.price,
    platformFee: fee,
    helperEarnings: Math.round((helper.price - fee) * 100) / 100,
    paymentStatus: "not_charged",
    createdAt: time,
    updatedAt: time,
  };
  // The request's location is a snapshot. Future GPS changes won't move a job.
  driver.lat = input.lat;
  driver.lng = input.lng;
  driver.locationLabel = input.locationLabel.trim();
  data.jobs.unshift(job);
  return job;
}

export function actOnJob(data: DemoData, id: string, input: ActionInput): Job {
  const job = data.jobs.find((item) => item.id === id);
  if (!job) throw new DemoError(404, "Request not found.");
  const driver = job.requesterId === input.actorId;
  const helper = job.helperId === input.actorId;
  if (!driver && !helper) throw new DemoError(403, "Only the driver and chosen helper can update this request.");
  const { action } = input;
  if (["accept", "decline", "arrive"].includes(action) && !helper) throw new DemoError(403, "Switch to the chosen helper to do this.");
  if (action === "fail" && !driver) throw new DemoError(403, "Only the driver can report an unsuccessful jump-start.");

  const targets: Record<ActionInput["action"], Job["status"]> = {
    accept: "accepted", decline: "declined", arrive: "arrived", complete: "completed", fail: "failed", cancel: "cancelled",
  };
  if (job.status === targets[action]) return job;
  if (!isActive(job)) throw new DemoError(409, "This request is already closed.");

  switch (action) {
    case "accept": {
      if (job.status !== "pending") throw new DemoError(409, "Only a pending request can be accepted.");
      const user = data.users.find((item) => item.id === input.actorId);
      if (!user?.available) throw new DemoError(409, "Turn on your helper availability before accepting.");
      job.status = "accepted";
      break;
    }
    case "decline":
      if (job.status !== "pending") throw new DemoError(409, "Only a pending request can be declined.");
      job.status = "declined";
      break;
    case "arrive":
      if (job.status !== "accepted") throw new DemoError(409, "Accept the request before marking yourself arrived.");
      job.status = "arrived";
      break;
    case "complete":
      if (job.status !== "arrived") throw new DemoError(409, "The helper must arrive before you confirm a successful jump-start.");
      job.status = "completed";
      job.paymentStatus = "simulated_paid";
      // The status guard makes this increment exactly once.
      data.users.find((user) => user.id === job.helperId)!.completedHelps += 1;
      break;
    case "fail":
      if (job.status !== "arrived") throw new DemoError(409, "Report an unsuccessful jump-start after the helper arrives.");
      job.status = "failed";
      break;
    case "cancel":
      job.status = "cancelled";
      break;
  }
  job.updatedAt = new Date().toISOString();
  return job;
}
