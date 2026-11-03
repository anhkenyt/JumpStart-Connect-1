import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// A separate private namespace for each browser's five switchable demo users.
// This is demo isolation, not authentication for real roadside jobs.
export const jumpstartDemoSessions = pgTable("jumpstart_demo_sessions", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertJumpstartDemoSessionSchema = createInsertSchema(jumpstartDemoSessions);
export type JumpstartDemoSession = typeof jumpstartDemoSessions.$inferSelect;
