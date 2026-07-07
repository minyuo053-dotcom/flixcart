import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, products, categories, productMessages } from "../../db/schema";
import { PLATFORM_FEE_PERCENT } from "../lib/wallet";

export const adminRouter = createRouter({
  listUsers: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(users);
  }),

  // Promote/demote between "user" and "seller". Admin role is only ever set
  // via the seed-admin script, not through this endpoint.
  setSellerStatus: adminQuery
    .input(z.object({ userId: z.number(), isSeller: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [target] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!target || target.role === "admin") {
        return { success: false, message: "User not found or cannot be changed" };
      }
      await db
        .update(users)
        .set({ role: input.isSeller ? "seller" : "user" })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  // Raw product list for the admin dashboard -- shows the seller's actual
  // listed price (not the fee-inclusive customer price) plus who owns it.
  listProducts: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        image: products.image,
        sellerId: products.sellerId,
        sellerName: users.name,
        sellerEmail: users.email,
        categoryId: products.categoryId,
        categoryName: categories.name,
        approvalStatus: products.approvalStatus,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt));
  }),

  feeInfo: adminQuery.query(() => ({ platformFeePercent: PLATFORM_FEE_PERCENT })),

  // Approve/reject a seller's product listing after reviewing their video
  // in the product chat. The decision is also posted into that same chat
  // so the seller sees exactly why.
  reviewProduct: adminQuery
    .input(
      z.object({
        productId: z.number(),
        decision: z.enum(["approved", "rejected"]),
        note: z.string().trim().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(products)
        .set({ approvalStatus: input.decision })
        .where(eq(products.id, input.productId));

      await db.insert(productMessages).values({
        productId: input.productId,
        senderId: ctx.user.id,
        senderRole: "admin",
        message:
          input.note ||
          (input.decision === "approved"
            ? "Your product has been approved and is now live."
            : "Your product was not approved. Please review and resubmit."),
      });

      return { success: true };
    }),
});
