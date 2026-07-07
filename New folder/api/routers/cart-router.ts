import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { cartItems, products, categories } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { getCustomerPrice } from "../lib/wallet";

export const cartRouter = createRouter({
  list: publicQuery
    .input(z.object({
      userId: z.number().optional(),
      sessionId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();

      let condition;
      if (input.userId) {
        condition = eq(cartItems.userId, input.userId);
      } else if (input.sessionId) {
        condition = eq(cartItems.sessionId, input.sessionId);
      } else {
        return [];
      }

      const rows = await db
        .select({
          id: cartItems.id,
          quantity: cartItems.quantity,
          productId: cartItems.productId,
          productName: products.name,
          productPrice: products.price,
          productSellerId: products.sellerId,
          productImage: products.image,
          productStock: products.stock,
          categoryName: categories.name,
          categoryColor: categories.color,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(condition);

      // productPrice is the seller's listed price; customers pay that plus
      // the platform fee added on top.
      return rows.map((row) => ({
        ...row,
        productPrice: getCustomerPrice(row.productPrice ?? "0", row.productSellerId).toFixed(2),
      }));
    }),

  add: publicQuery
    .input(z.object({
      productId: z.number(),
      quantity: z.number().min(1).default(1),
      userId: z.number().optional(),
      sessionId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if item already in cart
      let existing;
      if (input.userId) {
        [existing] = await db
          .select()
          .from(cartItems)
          .where(and(
            eq(cartItems.userId, input.userId),
            eq(cartItems.productId, input.productId)
          ))
          .limit(1);
      } else if (input.sessionId) {
        [existing] = await db
          .select()
          .from(cartItems)
          .where(and(
            eq(cartItems.sessionId, input.sessionId),
            eq(cartItems.productId, input.productId)
          ))
          .limit(1);
      }

      if (existing) {
        // Update quantity
        await db
          .update(cartItems)
          .set({ quantity: existing.quantity + input.quantity })
          .where(eq(cartItems.id, existing.id));
        return { success: true, action: "updated", itemId: existing.id };
      }

      // Insert new
      const result = await db.insert(cartItems).values({
        productId: input.productId,
        quantity: input.quantity,
        userId: input.userId || null,
        sessionId: input.sessionId || null,
      });

      return { success: true, action: "added", itemId: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({
      itemId: z.number(),
      quantity: z.number().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(cartItems)
        .set({ quantity: input.quantity })
        .where(eq(cartItems.id, input.itemId));
      return { success: true };
    }),

  remove: publicQuery
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      return { success: true };
    }),

  clear: publicQuery
    .input(z.object({
      userId: z.number().optional(),
      sessionId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      if (input.userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, input.userId));
      } else if (input.sessionId) {
        await db.delete(cartItems).where(eq(cartItems.sessionId, input.sessionId));
      }
      return { success: true };
    }),
});
