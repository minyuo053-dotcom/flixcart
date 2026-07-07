import { z } from "zod";
import * as cookie from "cookie";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { otpCodes } from "../../db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendOtpEmail } from "../lib/email";
import { findUserByUnionId, upsertUser } from "../queries/users";
import { signSessionToken } from "../kimi/session";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email-based accounts are stored using this as their unionId, so the exact
// same session/cookie/authentication machinery used for OAuth logins works
// for normal email accounts too.
function unionIdForEmail(email: string): string {
  return `email:${email.toLowerCase().trim()}`;
}

export const otpRouter = createRouter({
  send: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const email = input.email.toLowerCase().trim();
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db.insert(otpCodes).values({
        email,
        code,
        purpose: "signup",
        expiresAt,
      });

      // Always log the code server-side so you can log in during local/dev
      // testing even before SMTP is configured.
      console.log(`OTP for ${email}: ${code}`);

      const sent = await sendOtpEmail(email, code);

      return {
        success: true,
        sent,
        message: sent
          ? "OTP sent to your email"
          : `Your OTP is: ${code} (email delivery is not configured yet)`,
      };
    }),

  verify: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
        name: z.string().trim().min(1).max(255).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const email = input.email.toLowerCase().trim();

      const [record] = await db
        .select()
        .from(otpCodes)
        .where(
          and(
            eq(otpCodes.email, email),
            eq(otpCodes.code, input.code),
            eq(otpCodes.used, false),
            gt(otpCodes.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!record) {
        return { success: false, message: "Invalid or expired OTP" };
      }

      await db
        .update(otpCodes)
        .set({ used: true })
        .where(eq(otpCodes.id, record.id));

      // Find or create the real user account tied to this email.
      const unionId = unionIdForEmail(email);
      const existing = await findUserByUnionId(unionId);
      const isNewUser = !existing;

      await upsertUser({
        unionId,
        email,
        name: input.name || existing?.name || email.split("@")[0],
        isVerified: true,
        lastSignInAt: new Date(),
      });

      const user = await findUserByUnionId(unionId);

      // Issue a real session cookie, exactly like the OAuth login flow does,
      // so the user is actually logged in after verifying their code.
      const token = await signSessionToken({ unionId, clientId: "email" });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: cookieOpts.httpOnly,
          path: cookieOpts.path,
          sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none",
          secure: cookieOpts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return {
        success: true,
        message: "Email verified successfully",
        isNewUser,
        user,
      };
    }),
});
