import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { products, categories } from "../../db/schema";
import { eq, like, or, and, desc } from "drizzle-orm";
import { getCustomerPrice } from "../lib/wallet";

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { categoryId, search, page = 1, limit = 20 } = input || {};

      // Only ever show customers products an admin has approved.
      const conditions = [eq(products.approvalStatus, "approved")];
      if (categoryId) {
        conditions.push(eq(products.categoryId, categoryId));
      }
      if (search) {
        conditions.push(
          or(
            like(products.name, `%${search}%`),
            like(products.description, `%${search}%`)
          )!
        );
      }

      const offset = (page - 1) * limit;
      const rows = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          sellerId: products.sellerId,
          image: products.image,
          categoryId: products.categoryId,
          stock: products.stock,
          rating: products.rating,
          createdAt: products.createdAt,
          categoryName: categories.name,
          categoryColor: categories.color,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(products.createdAt));

      // The stored price is what the seller listed; customers pay that plus
      // the platform fee (added on top, never deducted from the seller).
      return rows.map((row) => ({
        ...row,
        price: getCustomerPrice(row.price, row.sellerId).toFixed(2),
      }));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [product] = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          sellerId: products.sellerId,
          image: products.image,
          categoryId: products.categoryId,
          stock: products.stock,
          rating: products.rating,
          approvalStatus: products.approvalStatus,
          createdAt: products.createdAt,
          categoryName: categories.name,
          categoryColor: categories.color,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.id, input.id))
        .limit(1);
      if (!product || product.approvalStatus !== "approved") return null;
      return { ...product, price: getCustomerPrice(product.price, product.sellerId).toFixed(2) };
    }),

  search: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          sellerId: products.sellerId,
          image: products.image,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(
          and(
            eq(products.approvalStatus, "approved"),
            or(
              like(products.name, `%${input.query}%`),
              like(products.description, `%${input.query}%`)
            )
          )
        )
        .limit(10);
      return rows.map((row) => ({
        ...row,
        price: getCustomerPrice(row.price, row.sellerId).toFixed(2),
      }));
    }),
});
