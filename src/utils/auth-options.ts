import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (process.env.NODE_ENV === "development" && user.email === "test@yourdomain.com") {
        return true;
      }
      if (!process.env.ALLOWED_EMAIL) {
        console.warn("ALLOWED_EMAIL not configured - sign-in denied");
        return false;
      }
      return user.email === process.env.ALLOWED_EMAIL;
    },
    async session({ session }) {
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/interviews`;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
