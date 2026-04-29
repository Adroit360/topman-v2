/**
 * Seed script to create the initial admin user.
 *
 * Usage:
 *   pnpm tsx src/db/scripts/seedAdmin.ts
 *
 * This script creates a user directly in the database.
 */

import { db } from "../index";
import { user } from "../schema/user";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@topman.com";
const ADMIN_NAME = "Admin";

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, ADMIN_EMAIL))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      console.log(
        "To promote to admin role, run:\n" +
          `  UPDATE users SET role = 1 WHERE email = '${ADMIN_EMAIL}';`,
      );
      process.exit(0);
    }

    // Create user without password
    const userId = crypto.randomUUID();
    await db.insert(user).values({
      id: userId,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      emailVerified: false,
    });

    console.log("✓ Admin user created successfully");
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Name: ${ADMIN_NAME}`);
    console.log("\nNext steps:");
    console.log("  1. Run this SQL to promote to admin role:");
    console.log(
      `     UPDATE users SET role = 1 WHERE email = '${ADMIN_EMAIL}';`,
    );
    console.log("  2. Sign up via /login to set password");

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin user:", error);
    process.exit(1);
  }
}

seedAdmin();
