import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders, orderItems, cartItems, products } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { creditOrderToWallets } from "../lib/wallet";

export const orderRouter = createRouter({
  create: publicQuery
    .input(z.object({
      userId: z.number().optional(),
      sessionId: z.string().optional(),
      paymentMethod: z.enum(["card", "cod"]),
      deliveryAddress: z.string().min(10),
      phone: z.string().min(10),
      totalAmount: z.string(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number(),
        price: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Create order
      const orderResult = await db.insert(orders).values({
        userId: input.userId || null,
        status: "confirmed",
        totalAmount: input.totalAmount,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "cod" ? "pending" : "paid",
        deliveryAddress: input.deliveryAddress,
        phone: input.phone,
      });

      const orderId = Number(orderResult[0].insertId);

      // Create order items
      for (const item of input.items) {
        await db.insert(orderItems).values({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      // Clear cart
      if (input.userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, input.userId));
      } else if (input.sessionId) {
        await db.delete(cartItems).where(eq(cartItems.sessionId, input.sessionId));
      }

      return { success: true, orderId };
    }),

  list: publicQuery
    .input(z.object({
      userId: z.number().optional(),
      sessionId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();

      let condition;
      if (input.userId) {
        condition = eq(orders.userId, input.userId);
      } else if (input.sessionId) {
        // For session-based, we can't filter orders well, return empty
        return [];
      } else {
        return [];
      }

      return db
        .select()
        .from(orders)
        .where(condition)
        .orderBy(desc(orders.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) return null;

      const items = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          productName: products.name,
          productImage: products.image,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, input.id));

      return { ...order, items };
    }),

  // Admin-only: move an order through its lifecycle. For "cash on delivery"
  // orders, the platform only actually has the money once the order is
  // delivered, so that's when seller/admin wallets get credited.
  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "pending",
          "confirmed",
          "preparing",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: Partial<typeof orders.$inferInsert> = { status: input.status };

      const [existing] = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
      if (!existing) {
        return { success: false, message: "Order not found" };
      }

      if (input.status === "delivered" && existing.paymentMethod === "cod") {
        updates.paymentStatus = "paid";
      }

      await db.update(orders).set(updates).where(eq(orders.id, input.id));

      if (input.status === "delivered") {
        await creditOrderToWallets(input.id);
      }

      return { success: true };
    }),
});
