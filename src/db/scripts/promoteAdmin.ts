/**
 * Promote admin user to role = 1
 *
 * Usage:
 *   pnpm tsx src/db/scripts/promoteAdmin.ts
 */

import { db } from "../index";
import { user } from "../schema/user";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@topman.com";

async function promoteAdmin() {
  try {
    const result = await db
      .update(user)
      .set({ role: 1 })
      .where(eq(user.email, ADMIN_EMAIL));

    console.log("✓ Admin user promoted to role = 1");
    console.log(`  Email: ${ADMIN_EMAIL}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to promote admin user:", error);
    process.exit(1);
  }
}

promoteAdmin();
