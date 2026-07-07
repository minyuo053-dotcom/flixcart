import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "seller", "admin"]).default("user").notNull(),
  // Only set for the admin account, so admin can optionally log in with
  // email + password instead of the email + OTP flow everyone else uses.
  passwordHash: varchar("password_hash", { length: 255 }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export const otpCodes = mysqlTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  purpose: mysqlEnum("purpose", ["signup", "reset"]).default("signup"),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 20 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: varchar("image", { length: 500 }),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }).references(() => categories.id),
  // Which seller listed this product. Null means it's an admin/house listing,
  // so the full sale amount goes to the admin wallet with no fee split.
  sellerId: bigint("seller_id", { mode: "number", unsigned: true }).references(() => users.id),
  // Seller-listed products start "pending" and only show to customers once
  // an admin approves them (after reviewing the seller's video in the chat
  // below). House listings (no seller) are approved automatically.
  approvalStatus: mysqlEnum("approval_status", ["pending", "approved", "rejected"]).default("approved").notNull(),
  stock: int("stock").default(100),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("4.5"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = mysqlTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }),
  productId: bigint("product_id", { mode: "number", unsigned: true }).references(() => products.id),
  quantity: int("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id),
  status: mysqlEnum("status", ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]).default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["card", "cod"]).notNull(),
  paymentStatus: mysqlEnum("payment_status", ["pending", "paid", "failed"]).default("pending"),
  // Set once seller/admin wallets have been credited for this order's items,
  // so a retry or status change never pays out twice for the same order.
  walletCredited: boolean("wallet_credited").default(false),
  deliveryAddress: text("delivery_address"),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).references(() => orders.id),
  productId: bigint("product_id", { mode: "number", unsigned: true }).references(() => products.id),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Every wallet credit/debit is one row here. A user's balance is always the
// SUM of their rows, so the balance can never drift out of sync with history.
export const walletTransactions = mysqlTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  // Positive = money coming in (a sale, a fee, a refunded/rejected withdrawal).
  // Negative = money going out (a withdrawal request).
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["sale", "fee", "withdrawal", "refund", "adjustment"]).notNull(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).references(() => orders.id),
  withdrawalId: bigint("withdrawal_id", { mode: "number", unsigned: true }),
  description: varchar("description", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawals = mysqlTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "paid"]).default("pending").notNull(),
  // Where the money should be sent -- a normal bank/mobile-money account.
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 100 }).notNull(),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// The approval conversation between a seller and admin for one product.
// Sellers are expected to upload a short live video of themselves with the
// product here; admin reviews it in this same thread before approving.
export const productMessages = mysqlTable("product_messages", {
  id: serial("id").primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).references(() => products.id).notNull(),
  senderId: bigint("sender_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  senderRole: mysqlEnum("sender_role", ["seller", "admin"]).notNull(),
  message: text("message"),
  videoUrl: varchar("video_url", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type OtpCode = typeof otpCodes.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type ProductMessage = typeof productMessages.$inferSelect;
