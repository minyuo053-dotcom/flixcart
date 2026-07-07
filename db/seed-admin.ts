import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { users } from "./schema";

function unionIdForEmail(email: string): string {
  return `email:${email.toLowerCase().trim()}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file before running this script.",
    );
    process.exit(1);
  }

  const db = getDb();
  const unionId = unionIdForEmail(email);
  const passwordHash = await bcrypt.hash(password, 12);

  const [existing] = await db.select().from(users).where(eq(users.unionId, unionId)).limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ role: "admin", passwordHash, email, isVerified: true })
      .where(eq(users.unionId, unionId));
    console.log(`Updated existing account (${email}) to admin with a new password.`);
  } else {
    await db.insert(users).values({
      unionId,
      email,
      name: "Admin",
      role: "admin",
      passwordHash,
      isVerified: true,
    });
    console.log(`Created new admin account for ${email}.`);
  }

  console.log(
    "\nYou can now log in at /admin/login with that email and password, " +
      "or with the normal email + OTP flow at /login (either way you'll get admin access).",
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to seed admin account:", err);
  process.exit(1);
});
