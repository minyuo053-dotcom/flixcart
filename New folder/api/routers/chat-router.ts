import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { chatMessages } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

const botResponses: Record<string, string> = {
  default: "Hi there! I'm Flexi, your shopping assistant. How can I help you today? I can help you find products, track orders, or answer questions about delivery!",
  greeting: "Hey! Welcome to FlexiCart! Looking for something specific? Try browsing our categories - Food, Fashion, Gadgets, or Home essentials!",
  food: "Hungry? We've got amazing food options! Check out our Gourmet Burger ($12.99), Fresh Organic Bowl ($15.99), or Artisan Coffee ($5.99). Delivery in 25 minutes!",
  fashion: "Looking fresh? Our Street Sneakers ($89.99) and Denim Jacket ($79.99) are trending right now. Same-day delivery available!",
  gadgets: "Tech lover? Our Pro Headphones ($199.99) with ANC are a bestseller. The Smart Watch ($149.99) is also popular for fitness tracking!",
  home: "Upgrade your space! Our Smart Desk Lamp ($49.99) with touch controls is a customer favorite. Check out the Home category for more!",
  delivery: "We deliver in an average of 28 minutes! You can track your order in real-time once it's placed. We cover most areas in the city.",
  payment: "We accept secure card payments (encrypted) and Pay on Delivery. Your payment info is never stored on our servers.",
  return: "Not satisfied? We offer easy returns within 7 days. Just contact our support team through this chat or email support@flexicart.com.",
  help: "I can help you with:\n- Finding products\n- Checking delivery times\n- Payment options\n- Order tracking\n- Returns & refunds\n\nWhat do you need?",
};

function getBotResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.match(/hello|hi|hey|greetings/)) return botResponses.greeting;
  if (lower.match(/food|hungry|eat|burger|pizza|meal|dinner|lunch/)) return botResponses.food;
  if (lower.match(/fashion|clothes|shirt|shoe|sneaker|jacket|wear|style/)) return botResponses.fashion;
  if (lower.match(/gadget|tech|electronics|headphone|watch|speaker|device/)) return botResponses.gadgets;
  if (lower.match(/home|lamp|decor|furniture|house/)) return botResponses.home;
  if (lower.match(/deliver|shipping|time|how long|when|track/)) return botResponses.delivery;
  if (lower.match(/payment|pay|card|cod|cash/)) return botResponses.payment;
  if (lower.match(/return|refund|exchange/)) return botResponses.return;
  if (lower.match(/help|support|assist/)) return botResponses.help;

  return botResponses.default;
}

export const chatRouter = createRouter({
  send: publicQuery
    .input(z.object({
      message: z.string().min(1).max(1000),
      userId: z.number().optional(),
      sessionId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Store user message
      await db.insert(chatMessages).values({
        userId: input.userId || null,
        sessionId: input.sessionId || null,
        role: "user",
        content: input.message,
      });

      // Generate response
      const response = getBotResponse(input.message);

      // Store bot response
      await db.insert(chatMessages).values({
        userId: input.userId || null,
        sessionId: input.sessionId || null,
        role: "assistant",
        content: response,
      });

      return { response };
    }),

  history: publicQuery
    .input(z.object({
      userId: z.number().optional(),
      sessionId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();

      let condition;
      if (input.userId) {
        condition = eq(chatMessages.userId, input.userId);
      } else if (input.sessionId) {
        condition = eq(chatMessages.sessionId, input.sessionId);
      } else {
        return [];
      }

      return db
        .select()
        .from(chatMessages)
        .where(condition)
        .orderBy(desc(chatMessages.createdAt))
        .limit(50);
    }),
});
