import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { otpRouter } from "./routers/otp-router";
import { categoryRouter } from "./routers/category-router";
import { productRouter } from "./routers/product-router";
import { cartRouter } from "./routers/cart-router";
import { orderRouter } from "./routers/order-router";
import { paymentRouter } from "./routers/payment-router";
import { chatRouter } from "./routers/chat-router";
import { walletRouter, adminWalletRouter } from "./routers/wallet-router";
import { sellerRouter } from "./routers/seller-router";
import { adminRouter } from "./routers/admin-router";
import { productChatRouter } from "./routers/product-chat-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  otp: otpRouter,
  category: categoryRouter,
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
  payment: paymentRouter,
  chat: chatRouter,
  wallet: walletRouter,
  adminWallet: adminWalletRouter,
  seller: sellerRouter,
  admin: adminRouter,
  productChat: productChatRouter,
});

export type AppRouter = typeof appRouter;
