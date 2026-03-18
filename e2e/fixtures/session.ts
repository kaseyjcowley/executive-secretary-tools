import { encode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { redis } from "./redis";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "cVfM4hau1qdO8imEsVC417G1F3dKQ0ht";

export interface TestUser {
  id: string;
  name: string;
  email: string;
}

export async function seedSession(user: TestUser): Promise<string> {
  const sessionToken = `test-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const token: JWT = {
    sub: user.id,
    name: user.name,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    jti: `test-jti-${Date.now()}`,
  };

  const encodedToken = await encode({ token, secret: NEXTAUTH_SECRET });
  
  await redis.set(
    `next-auth.session-token.${sessionToken}`,
    JSON.stringify({
      user,
      expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    }),
    "EX",
    3600
  );

  return encodedToken;
}

export async function clearSession(sessionToken: string): Promise<void> {
  await redis.del(`next-auth.session-token.${sessionToken}`);
}
