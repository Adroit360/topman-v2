import {
  boolean,
  index,
  int,
  mysqlTable as table,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { createdAt, id, updatedAt } from "./schema-helper";

export const user = table("users", {
  id,
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 191 }).notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  role: int().default(0).notNull(),
  createdAt,
  updatedAt,
});

export const session = table(
  "sessions",
  {
    id,
    expiresAt: timestamp({ fsp: 3 }).notNull(),
    token: varchar({ length: 191 }).notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: varchar({ length: 191 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = table(
  "accounts",
  {
    id,
    accountId: varchar({ length: 255 }).notNull(),
    providerId: varchar({ length: 191 }).notNull(),
    userId: varchar({ length: 191 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ fsp: 3 }),
    refreshTokenExpiresAt: timestamp({ fsp: 3 }),
    scope: text(),
    password: text(),
    createdAt,
    updatedAt,
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = table(
  "verifications",
  {
    id,
    identifier: varchar({ length: 191 }).notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ fsp: 3 }).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);
