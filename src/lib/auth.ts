import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { account, session, user, verification } from "../db/schema";
import { getDb } from "./db";

export const getAuth = () => {
  const productionSecret = process.env.BETTER_AUTH_SECRET;

  if (process.env.NODE_ENV === "production" && !productionSecret) {
    throw new Error("BETTER_AUTH_SECRET must be configured in production.");
  }

  return betterAuth({
    secret: productionSecret ?? "development-only-better-auth-secret-change-me",
    baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
    trustedOrigins: process.env.NEXT_PUBLIC_APP_URL
      ? [process.env.NEXT_PUBLIC_APP_URL]
      : undefined,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    plugins: [nextCookies()],
  });
};
