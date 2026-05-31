import { pgTable, serial, timestamp, text, varchar, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

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
