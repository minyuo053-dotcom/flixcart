import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, sellerQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { products } from "../../db/schema";

export const sellerRouter = createRouter({
  myProducts: sellerQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(products)
      .where(eq(products.sellerId, ctx.user.id))
      .orderBy(desc(products.createdAt));
  }),

  createProduct: sellerQuery
    .input(
      z.object({
        name: z.string().trim().min(2).max(255),
        description: z.string().trim().max(2000).optional(),
        price: z.number().positive(),
        image: z.string().url().optional(),
        categoryId: z.number().optional(),
        stock: z.number().int().nonnegative().default(100),
        // Admin only: assign this listing to a specific seller, or omit/null
        // for a house listing (no platform fee added for customers).
        sellerId: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const sellerId = ctx.user.role === "admin" ? input.sellerId ?? null : ctx.user.id;
      // A seller listing their own product needs admin approval (via the
      // product chat + video) before customers can see it. Anything admin
      // adds directly -- house listing or otherwise -- is approved already.
      const approvalStatus = ctx.user.role === "admin" ? "approved" : "pending";
      const result = await db.insert(products).values({
        name: input.name,
        description: input.description,
        price: input.price.toFixed(2),
        image: input.image,
        categoryId: input.categoryId,
        stock: input.stock,
        sellerId,
        approvalStatus,
      });
      return { success: true, productId: Number(result[0].insertId) };
    }),

  updateProduct: sellerQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().trim().min(2).max(255).optional(),
        description: z.string().trim().max(2000).optional(),
        price: z.number().positive().optional(),
        image: z.string().url().optional(),
        categoryId: z.number().optional(),
        stock: z.number().int().nonnegative().optional(),
        // Admin only: reassign this listing to a different seller (or null
        // to make it a fee-free house listing).
        sellerId: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // Sellers can only edit their own products; admin can edit any.
      const ownershipFilter =
        ctx.user.role === "admin"
          ? eq(products.id, input.id)
          : and(eq(products.id, input.id), eq(products.sellerId, ctx.user.id));

      const { id, price, sellerId, ...rest } = input;
      const setValues: Record<string, unknown> = {
        ...rest,
        ...(price !== undefined ? { price: price.toFixed(2) } : {}),
      };
      // Only admin may reassign ownership; a seller passing sellerId is ignored.
      if (ctx.user.role === "admin" && sellerId !== undefined) {
        setValues.sellerId = sellerId;
      }

      await db.update(products).set(setValues).where(ownershipFilter);

      return { success: true };
    }),

  deleteProduct: sellerQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const ownershipFilter =
        ctx.user.role === "admin"
          ? eq(products.id, input.id)
          : and(eq(products.id, input.id), eq(products.sellerId, ctx.user.id));

      await db.delete(products).where(ownershipFilter);
      return { success: true };
    }),
});
