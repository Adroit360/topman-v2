/**
 * Set password for admin user
 *
 * Usage:
 *   pnpm tsx src/db/scripts/setAdminPassword.ts "your-password-here"
 */

import { db } from "../index";
import { account, user } from "../schema/user";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";

const ADMIN_EMAIL = "admin@topman.com";

async function setAdminPassword() {
  const password = process.argv[2];

  if (!password) {
    console.error("Usage: pnpm tsx src/db/scripts/setAdminPassword.ts <password>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  try {
    // Find the admin user
    const adminUser = await db
      .select()
      .from(user)
      .where(eq(user.email, ADMIN_EMAIL))
      .limit(1);

    if (!adminUser.length) {
      console.error(`Admin user not found: ${ADMIN_EMAIL}`);
      process.exit(1);
    }

    const userId = adminUser[0].id;

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if account exists
    const existingAccount = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId))
      .limit(1);

    if (existingAccount.length > 0) {
      // Update existing account
      await db
        .update(account)
        .set({ password: hashedPassword })
        .where(eq(account.userId, userId));
    } else {
      // Create new account
      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
      });
    }

    console.log("✓ Admin password set successfully");
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  You can now sign in at /login`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to set password:", error);
    process.exit(1);
  }
}

setAdminPassword();
