import { randomUUID } from "node:crypto";
import { Router, type IRouter, type ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import { pool } from "@workspace/db";
import {
  GetJumpstartStateResponse, GetNearbyHelpersQueryParams, GetNearbyHelpersResponse,
  UpdateDemoUserParams, UpdateDemoUserBody, UpdateDemoUserResponse,
  CreateJumpstartJobBody, CreateJumpstartJobResponse,
  ActOnJumpstartJobParams, ActOnJumpstartJobBody, ActOnJumpstartJobResponse,
} from "@workspace/api-zod";
import {
  DemoError, initialDemoData, readDemo, changeDemo, summarize,
  distanceKm, isBusy, createJob, actOnJob,
} from "../lib/jumpstart";

const router: IRouter = Router();
router.use("/jumpstart", cookieParser(), async (req, res, next): Promise<void> => {
  // Demo identities are explicitly fake and isolated per browser, never real auth.
  let id: string | undefined = req.cookies?.jumpstart_demo;
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) id = undefined;
  if (id) {
    const existing = await pool.query("SELECT id FROM jumpstart_demo_sessions WHERE id = $1", [id]);
    if (!existing.rowCount) id = undefined;
  }
  if (!id) {
    id = randomUUID();
    await pool.query("INSERT INTO jumpstart_demo_sessions (id, data) VALUES ($1, $2::jsonb)", [id, JSON.stringify(initialDemoData())]);
    res.cookie("jumpstart_demo", id, {
      httpOnly: true, sameSite: "lax", path: "/api/jumpstart",
      secure: req.secure || req.get("x-forwarded-proto") === "https",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  res.locals.demoId = id;
  res.set("Cache-Control", "no-store");
  next();
});

router.get("/jumpstart/state", async (_req, res): Promise<void> => {
  const data = await readDemo(res.locals.demoId);
  res.json(GetJumpstartStateResponse.parse(summarize(data)));
});

router.get("/jumpstart/helpers", async (req, res): Promise<void> => {
  const parsed = GetNearbyHelpersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide a valid user, latitude, longitude and radius." });
    return;
  }
  const { userId, lat, lng, radius = 20 } = parsed.data;
  const data = await readDemo(res.locals.demoId);
  if (!data.users.some((user) => user.id === userId)) throw new DemoError(404, "Demo user not found.");
  const nearby = data.users
    .filter((user) => user.id !== userId && user.available && !isBusy(data, user.id))
    .map((user) => {
      const distance = distanceKm(lat, lng, user.lat, user.lng);
      return {
        user,
        distanceKm: Math.round(distance * 100) / 100,
        estimatedMinutes: Math.max(3, Math.ceil(distance / 0.35 + 2)),
      };
    })
    .filter((item) => item.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  res.json(GetNearbyHelpersResponse.parse(nearby));
});

router.patch("/jumpstart/users/:id", async (req, res): Promise<void> => {
  const params = UpdateDemoUserParams.safeParse(req.params);
  const body = UpdateDemoUserBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Check the helper's details, coordinates, and price (AED 10–500)." });
    return;
  }
  if ((body.data.lat === undefined) !== (body.data.lng === undefined)) {
    res.status(400).json({ error: "Latitude and longitude must be updated together." });
    return;
  }
  const updated = await changeDemo(res.locals.demoId, (data) => {
    const user = data.users.find((item) => item.id === params.data.id);
    if (!user) throw new DemoError(404, "Demo user not found.");
    if (body.data.vehicle !== undefined && !body.data.vehicle.trim()) throw new DemoError(400, "Enter your vehicle.");
    if (body.data.locationLabel !== undefined && !body.data.locationLabel.trim()) throw new DemoError(400, "Enter your location.");
    const updates = Object.fromEntries(Object.entries(body.data).filter(([, value]) => value !== undefined));
    Object.assign(user, updates);
    return user;
  });
  res.json(UpdateDemoUserResponse.parse(updated));
});

router.post("/jumpstart/jobs", async (req, res): Promise<void> => {
  const body = CreateJumpstartJobBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Choose a helper, valid location, and agreed price." });
    return;
  }
  const job = await changeDemo(res.locals.demoId, (data) => createJob(data, body.data));
  res.status(201).json(CreateJumpstartJobResponse.parse(job));
});

router.post("/jumpstart/jobs/:id/action", async (req, res): Promise<void> => {
  const params = ActOnJumpstartJobParams.safeParse(req.params);
  const body = ActOnJumpstartJobBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Provide a valid request action and demo user." });
    return;
  }
  const job = await changeDemo(res.locals.demoId, (data) => actOnJob(data, params.data.id, body.data));
  res.json(ActOnJumpstartJobResponse.parse(job));
});

const onError: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof DemoError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  req.log.error({ err: error }, "Jumpstart request failed");
  res.status(500).json({ error: "Something went wrong saving the demo. Please try again." });
};
router.use(onError);
export default router;
