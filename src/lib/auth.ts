import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcrypt";
import { dbConnect } from "./db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        await dbConnect();
        const user = await User.findOne({ email: (creds as any).email });
        if (!user || !user.isVerified) return null;
        const ok = await bcrypt.compare((creds as any).password, user.password || "");
        return ok ? { id: String(user._id), name: user.name, email: user.email, isAdmin: !!user.isAdmin } as any : null;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(p) {
        return { id: p.sub, name: p.name, email: p.email };
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      async profile(p) {
        const email = p.email || (p.emails?.[0]?.email as any) || `github_${p.id}@noemail.com`;
        return { id: String(p.id), name: p.name || p.login, email };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      await dbConnect();
      if (!account) return false;
      if (account.provider === "google" || account.provider === "github") {
        const email = (profile as any)?.email;
        if (!email) return false;
        const existing = await User.findOne({ email });
        if (existing) {
          if (account.provider === "google" && !existing.googleId) existing.googleId = (profile as any).sub;
          if (account.provider === "github" && !existing.githubId) existing.githubId = String((profile as any).id);
          existing.isVerified = true; await existing.save();
        } else {
          await User.create({
            name: (profile as any).name || "User",
            email, isVerified: true,
            googleId: account.provider === "google" ? (profile as any).sub : undefined,
            githubId: account.provider === "github" ? String((profile as any).id) : undefined,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.isAdmin = (user as any).isAdmin || false;
      return token;
    },
    async session({ session, token }) {
      (session as any).user.isAdmin = (token as any).isAdmin || false;
      return session;
    },
  },
  pages: { signIn: "/login" },
};
