import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const createId = () => crypto.randomUUID();

export const assetTypeEnum = pgEnum("asset_type", ["image"]);
export const videoStatusEnum = pgEnum("video_status", [
  "rendering",
  "ready",
  "failed",
]);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("user_email_idx").on(table.email)],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("session_token_idx").on(table.token),
    index("session_user_id_idx").on(table.userId),
  ],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("account_provider_account_idx").on(
      table.providerId,
      table.accountId,
    ),
    index("account_user_id_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("verification_identifier_value_idx").on(
      table.identifier,
      table.value,
    ),
  ],
);

export const team = pgTable(
  "team",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("team_slug_idx").on(table.slug),
    index("team_owner_id_idx").on(table.ownerId),
  ],
);

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("project_team_slug_idx").on(table.teamId, table.slug),
    index("project_team_id_idx").on(table.teamId),
  ],
);

export const projectAsset = pgTable(
  "project_asset",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    url: text("url").notNull(),
    type: assetTypeEnum("type").notNull().default("image"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("project_asset_project_id_idx").on(table.projectId)],
);

export const video = pgTable(
  "video",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    assetId: text("asset_id").references(() => projectAsset.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    status: videoStatusEnum("status").notNull().default("rendering"),
    renderUrl: text("render_url"),
    size: integer("size"),
    inputProps: jsonb("input_props").notNull(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("video_project_created_at_idx").on(table.projectId, table.createdAt),
    index("video_asset_id_idx").on(table.assetId),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  teams: many(team),
  accounts: many(account),
  sessions: many(session),
}));

export const teamRelations = relations(team, ({ one, many }) => ({
  owner: one(user, {
    fields: [team.ownerId],
    references: [user.id],
  }),
  projects: many(project),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  team: one(team, {
    fields: [project.teamId],
    references: [team.id],
  }),
  assets: many(projectAsset),
  videos: many(video),
}));

export const projectAssetRelations = relations(projectAsset, ({ one, many }) => ({
  project: one(project, {
    fields: [projectAsset.projectId],
    references: [project.id],
  }),
  videos: many(video),
}));

export const videoRelations = relations(video, ({ one }) => ({
  project: one(project, {
    fields: [video.projectId],
    references: [project.id],
  }),
  asset: one(projectAsset, {
    fields: [video.assetId],
    references: [projectAsset.id],
  }),
}));
