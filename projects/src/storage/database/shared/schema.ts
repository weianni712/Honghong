import { pgTable, serial, timestamp, text, varchar, index, uniqueIndex, integer, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 用户状态枚举
export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "banned"]);

// 订单状态枚举
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "completed", "cancelled"]);

// 健康检查表
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    status: userStatusEnum("status").default("active").notNull(),
    is_admin: varchar("is_admin", { length: 10 }).default("false").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_username_idx").on(table.username),
    index("users_status_idx").on(table.status),
  ]
);

// 订单表
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull().references(() => users.id),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum("status").default("pending").notNull(),
    remark: text("remark").default(""),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("orders_user_id_idx").on(table.user_id),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.created_at),
  ]
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    cover_image: varchar("cover_image", { length: 50 }).default(''),
    category: varchar("category", { length: 50 }).default('沟通技巧'),
    tags: text("tags").default(''),
    read_time: varchar("read_time", { length: 20 }).default('5分钟'),
    publish_date: timestamp("publish_date", { withTimezone: true }).defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("blog_posts_category_idx").on(table.category),
    index("blog_posts_publish_date_idx").on(table.publish_date),
  ]
);
