import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, walletQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { products, productMessages } from "../../db/schema";
import { createVideoUploadUrl } from "../lib/s3";

async function assertCanAccessProductChat(userId: number, role: string, productId: number) {
  const db = getDb();
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
  if (role !== "admin" && product.sellerId !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You don't have access to this product's chat" });
  }
  return product;
}

export const productChatRouter = createRouter({
  messages: walletQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }) => {
      await assertCanAccessProductChat(ctx.user.id, ctx.user.role, input.productId);
      const db = getDb();
      return db
        .select()
        .from(productMessages)
        .where(eq(productMessages.productId, input.productId))
        .orderBy(asc(productMessages.createdAt));
    }),

  // Returns a short-lived URL the seller's browser can upload the video
  // file to directly, plus the final URL to send in sendMessage.
  getVideoUploadUrl: walletQuery
    .input(z.object({ contentType: z.string() }))
    .mutation(async ({ input }) => {
      return createVideoUploadUrl(input.contentType);
    }),

  sendMessage: walletQuery
    .input(
      z.object({
        productId: z.number(),
        message: z.string().trim().max(2000).optional(),
        videoUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.message && !input.videoUrl) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Message can't be empty" });
      }
      await assertCanAccessProductChat(ctx.user.id, ctx.user.role, input.productId);
      const db = getDb();
      await db.insert(productMessages).values({
        productId: input.productId,
        senderId: ctx.user.id,
        senderRole: ctx.user.role === "admin" ? "admin" : "seller",
        message: input.message,
        videoUrl: input.videoUrl,
      });
      return { success: true };
    }),
});
