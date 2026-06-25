import { loadEnvConfig } from "@next/env";
import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

loadEnvConfig(process.cwd());

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    AZURE_CONNECTION_STRING: z.string().min(1),
    AZURE_STORAGE_CONTAINER_LIST: z.string().min(1),
    AZURE_STORAGE_CONTAINER_BOOKS: z.string().min(1),
    PAYSTACK_PUBLIC_KEY: z.string().min(1),
    PAYSTACK_SECRET_KEY: z.string().min(1),
    HUBTEL_CLIENT_ID: z.string().min(1).optional(),
    HUBTEL_CLIENT_SECRET: z.string().min(1).optional(),
    HUBTEL_MERCHANT_ACCOUNT_NUMBER: z.string().min(1).optional(),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    SMTP_FROM_NAME: z.string().min(1),
    SMTP_FROM_EMAIL: z.string().min(1),
    CONTACT_TO_EMAIL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  },
});
