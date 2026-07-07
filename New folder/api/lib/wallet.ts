import { eq, sql } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { orders, orderItems, products, walletTransactions, users } from "@db/schema";

// Percentage added ON TOP of a seller's listed price to produce the price
// the customer actually pays. The seller always receives their full listed
// price; the fee is the admin's cut, added on top rather than deducted.
// Admin's own listings (no seller) have no fee -- admin just gets the price.
export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? "5");

/** The price a customer pays for a product, given its seller's listed price. */
export function getCustomerPrice(sellerListedPrice: number | string, sellerId: number | null): number {
  const base = Number(sellerListedPrice);
  if (!sellerId) return Math.round(base * 100) / 100;
  const withFee = base * (1 + PLATFORM_FEE_PERCENT / 100);
  return Math.round(withFee * 100) / 100;
}

async function findAdminId(): Promise<number | null> {
  const [admin] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);
  return admin?.id ?? null;
}

/**
 * Credits seller + admin wallets for a paid order. Safe to call more than
 * once for the same order -- it no-ops if that order was already credited.
 */
export async function creditOrderToWallets(orderId: number): Promise<void> {
  const db = getDb();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.walletCredited) return;

  const items = await db
    .select({
      quantity: orderItems.quantity,
      price: orderItems.price,
      sellerId: products.sellerId,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  const adminId = await findAdminId();

  for (const item of items) {
    // orderItems.price is what the customer actually paid per unit, which
    // already has the platform fee baked in for seller-listed products (see
    // getCustomerPrice). So here we back the fee back out: the seller still
    // gets their full originally-listed price, and the fee is the leftover
    // amount on top -- never a cut taken from the seller.
    const lineTotal = Number(item.price) * item.quantity;
    if (item.sellerId) {
      const sellerAmount = Math.round((lineTotal / (1 + PLATFORM_FEE_PERCENT / 100)) * 100) / 100;
      const fee = Math.round((lineTotal - sellerAmount) * 100) / 100;

      await db.insert(walletTransactions).values({
        userId: item.sellerId,
        amount: sellerAmount.toFixed(2),
        type: "sale",
        orderId,
        description: `Sale on order #${orderId}`,
      });

      if (adminId) {
        await db.insert(walletTransactions).values({
          userId: adminId,
          amount: fee.toFixed(2),
          type: "fee",
          orderId,
          description: `Platform fee (${PLATFORM_FEE_PERCENT}%) on order #${orderId}`,
        });
      }
    } else if (adminId) {
      // No seller on this listing -- it's an admin/house product, so admin
      // gets the full sale amount, not just a fee cut.
      await db.insert(walletTransactions).values({
        userId: adminId,
        amount: lineTotal.toFixed(2),
        type: "sale",
        orderId,
        description: `Sale on order #${orderId}`,
      });
    }
  }

  await db.update(orders).set({ walletCredited: true }).where(eq(orders.id, orderId));
}

export async function getWalletBalance(userId: number): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ total: sql<string>`COALESCE(SUM(${walletTransactions.amount}), 0)` })
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId));
  return Number(row?.total ?? 0);
}
