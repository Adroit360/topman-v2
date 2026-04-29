import { createId } from "@paralleldrive/cuid2";
import { timestamp, varchar } from "drizzle-orm/mysql-core";

export const id = varchar({ length: 191 })
  .notNull()
  .primaryKey()
  .$defaultFn(() => createId());

export const createdAt = timestamp({ mode: "date" })
  .notNull()
  .$defaultFn(() => new Date());

export const updatedAt = timestamp({ mode: "date" })
  .notNull()
  .$defaultFn(() => new Date())
  .$onUpdate(() => new Date());
