import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../../data/env";
import * as schema from "./schema";

export const client = mysql.createPool({
  uri: env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30_000,
});

export const db = drizzle({
  client,
  schema,
  mode: "default",
  logger: process.env.NODE_ENV === "development",
});
