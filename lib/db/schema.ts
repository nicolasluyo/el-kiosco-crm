import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";

export const conversationStatusEnum = pgEnum("conversation_status", [
  "active",
  "closed",
  "needs_human",
]);

export const messageDirectionEnum = pgEnum("message_direction", [
  "incoming",
  "outgoing",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "confirmed",
  "cancelled",
  "modified",
]);

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  instagramUserId: text("instagram_user_id").notNull().unique(),
  username: text("username"),
  fullName: text("full_name"),
  profilePicUrl: text("profile_pic_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastContactAt: timestamp("last_contact_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  status: conversationStatusEnum("status").default("active").notNull(),
  agentEnabled: boolean("agent_enabled").default(true).notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  direction: messageDirectionEnum("direction").notNull(),
  content: text("content").notNull(),
  instagramMessageId: text("instagram_message_id"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  guests: integer("guests").notNull(),
  occasion: text("occasion"),
  notes: text("notes"),
  status: reservationStatusEnum("status").default("confirmed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agentLogs = pgTable("agent_logs", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  toolCalled: text("tool_called"),
  toolInput: text("tool_input"),
  toolOutput: text("tool_output"),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type AgentLog = typeof agentLogs.$inferSelect;
