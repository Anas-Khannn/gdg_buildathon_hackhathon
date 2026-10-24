import {
  pgTable,
  text,
  integer,
  serial,
  uuid,
  doublePrecision,
  numeric,
  boolean,
  timestamp,
  pgEnum,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { type AdapterAccountType } from "next-auth/adapters";

// --- ENUMS ---
export const problemTypeEnum = pgEnum("problem_type", [
  "blocked_drain",
  "standing_water",
  "open_manhole",
  "garbage_in_drain",
  "other",
]);

export const severityEnum = pgEnum("severity", ["ankle", "knee", "danger"]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "sent",
  "marked_fixed",
  "verified_fixed",
]);

// --- AREAS TABLE ---
export const areas = pgTable("areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  name_ur: text("name_ur"),
  name_ps: text("name_ps"),
});

// --- USERS TABLE (Auth.js Compatible + role) ---
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: text("role").notNull().default("user"), // 'user' or 'admin'
  password: text("password"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// --- REPORTS TABLE ---
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    photoFile: text("photo_file").notNull(),
    type: problemTypeEnum("type").notNull(),
    severity: severityEnum("severity").notNull(),
    complaintText: text("complaint_text"),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    areaId: integer("area_id").references(() => areas.id),
    status: reportStatusEnum("status").notNull().default("open"),
    aiConfidence: numeric("ai_confidence"),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    markedFixedAt: timestamp("marked_fixed_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
  },
  (table) => [index("reports_lat_lng_idx").on(table.lat, table.lng)]
);

// --- CONFIRMATIONS TABLE ---
export const confirmations = pgTable(
  "confirmations",
  {
    reportId: uuid("report_id")
      .references(() => reports.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.reportId, table.userId] })]
);

// --- FIX CHECKS TABLE ---
export const fixChecks = pgTable(
  "fix_checks",
  {
    reportId: uuid("report_id")
      .references(() => reports.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id").notNull(),
    isFixed: boolean("is_fixed").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.reportId, table.userId] })]
);

// Type definitions
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type Area = typeof areas.$inferSelect;
export type User = typeof users.$inferSelect;
