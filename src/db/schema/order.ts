import {
  decimal,
  int,
  mysqlTable as table,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import { createdAt, id, updatedAt } from "./schema-helper";
import { user } from "./user";
import { book } from "./book";
import { relations } from "drizzle-orm";

export const order = table("orders", {
  id,
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 191 }).notNull(),
  userId: varchar({ length: 191 }).references(() => user.id),
  total: decimal({ precision: 10, scale: 2 }).notNull(),
  processingFee: decimal({ precision: 10, scale: 2 }).notNull().default("0.00"),
  phone: varchar({ length: 20 }).notNull(),
  deliveryAddress: varchar({ length: 255 }).notNull(),
  notes: text(),
  adminNotes: text(),
  deliveryStatus: int().notNull().default(0),
  deliveryCost: int().notNull(),
  serialNumber: int().notNull().unique().autoincrement(),
  paymentStatus: int().notNull().default(0),
  paymentReference: varchar({ length: 255 }),
  datePaid: varchar({ length: 255 }),
  ipAddress: varchar({ length: 255 }),
  createdAt,
  updatedAt,
});

export const orderItems = table("order_items", {
  id,
  quantity: int().notNull(),
  bookId: varchar({ length: 191 })
    .notNull()
    .references(() => book.id),
  orderId: varchar({ length: 191 })
    .notNull()
    .references(() => order.id),
  createdAt,
  updatedAt,
});

export const orderPayment = table("order_payments", {
  id,
  reference: varchar({ length: 255 }).notNull(),
  orderId: varchar({ length: 191 })
    .notNull()
    .references(() => order.id),
  createdAt,
  updatedAt,
});

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
    relationName: "user_order",
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(order, {
    fields: [orderItems.orderId],
    references: [order.id],
    relationName: "orderItems",
  }),
  book: one(book, {
    fields: [orderItems.bookId],
    references: [book.id],
    relationName: "books",
  }),
}));
