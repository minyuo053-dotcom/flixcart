import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, walletQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { walletTransactions, withdrawals } from "../../db/schema";
import { getWalletBalance } from "../lib/wallet";

const MIN_WITHDRAWAL = 1;

export const walletRouter = createRouter({
  // Current balance + a page of recent ledger entries (sales, fees, withdrawals).
  summary: walletQuery.query(async ({ ctx }) => {
    const db = getDb();
    const balance = await getWalletBalance(ctx.user.id);
    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, ctx.user.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(50);

    return { balance, transactions };
  }),

  myWithdrawals: walletQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, ctx.user.id))
      .orderBy(desc(withdrawals.createdAt));
  }),

  // Request a payout to a normal bank / mobile-money account. The amount is
  // deducted from the available balance immediately (as a pending
  // withdrawal) so it can't be requested twice while awaiting approval.
  requestWithdrawal: walletQuery
    .input(
      z.object({
        amount: z.number().positive(),
        bankName: z.string().trim().min(2).max(255),
        accountName: z.string().trim().min(2).max(255),
        accountNumber: z.string().trim().min(4).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (input.amount < MIN_WITHDRAWAL) {
        return { success: false, message: `Minimum withdrawal is $${MIN_WITHDRAWAL.toFixed(2)}` };
      }

      const balance = await getWalletBalance(ctx.user.id);
      if (input.amount > balance) {
        return { success: false, message: "Withdrawal amount exceeds available balance" };
      }

      const result = await db.insert(withdrawals).values({
        userId: ctx.user.id,
        amount: input.amount.toFixed(2),
        status: "pending",
        bankName: input.bankName,
        accountName: input.accountName,
        accountNumber: input.accountNumber,
      });
      const withdrawalId = Number(result[0].insertId);

      await db.insert(walletTransactions).values({
        userId: ctx.user.id,
        amount: (-input.amount).toFixed(2),
        type: "withdrawal",
        withdrawalId,
        description: `Withdrawal request #${withdrawalId} pending approval`,
      });

      return { success: true, message: "Withdrawal request submitted", withdrawalId };
    }),
});

export const adminWalletRouter = createRouter({
  listWithdrawals: adminQuery
    .input(z.object({ status: z.enum(["pending", "approved", "rejected", "paid"]).optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.status) {
        return db
          .select()
          .from(withdrawals)
          .where(eq(withdrawals.status, input.status))
          .orderBy(desc(withdrawals.createdAt));
      }
      return db.select().from(withdrawals).orderBy(desc(withdrawals.createdAt));
    }),

  // approved -> admin has accepted the request; paid -> money has actually
  // been sent; rejected -> refund the held amount back into the wallet.
  updateWithdrawal: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected", "paid"]),
        adminNote: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [withdrawal] = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.id, input.id))
        .limit(1);

      if (!withdrawal) {
        return { success: false, message: "Withdrawal not found" };
      }
      if (withdrawal.status !== "pending" && input.status !== "paid") {
        return { success: false, message: "Only pending withdrawals can be approved/rejected" };
      }

      await db
        .update(withdrawals)
        .set({ status: input.status, adminNote: input.adminNote, processedAt: new Date() })
        .where(eq(withdrawals.id, input.id));

      if (input.status === "rejected") {
        await db.insert(walletTransactions).values({
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          type: "refund",
          withdrawalId: withdrawal.id,
          description: `Withdrawal request #${withdrawal.id} rejected -- funds returned`,
        });
      }

      return { success: true };
    }),
});
