import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders } from "../../db/schema";
import { eq } from "drizzle-orm";
import { creditOrderToWallets } from "../lib/wallet";

export const paymentRouter = createRouter({
  processCard: publicQuery
    .input(z.object({
      orderId: z.number(),
      cardNumber: z.string(),
      expiry: z.string(),
      cvv: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Simulate card validation
      const cleanedCard = input.cardNumber.replace(/\s/g, "");
      if (cleanedCard.length < 13 || cleanedCard.length > 19) {
        return { success: false, message: "Invalid card number" };
      }

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 95% success rate for simulation
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        await db
          .update(orders)
          .set({ paymentStatus: "paid", status: "confirmed" })
          .where(eq(orders.id, input.orderId));

        await creditOrderToWallets(input.orderId);

        return { success: true, message: "Payment successful", transactionId: `TXN${Date.now()}` };
      } else {
        await db
          .update(orders)
          .set({ paymentStatus: "failed" })
          .where(eq(orders.id, input.orderId));

        return { success: false, message: "Payment declined. Please try a different card." };
      }
    }),

  processCOD: publicQuery
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(orders)
        .set({ paymentStatus: "pending", status: "confirmed" })
        .where(eq(orders.id, input.orderId));

      return { success: true, message: "Pay on delivery confirmed" };
    }),
});
