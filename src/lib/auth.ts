// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
} else {
  console.warn("[auth] Google env eksik, Google provider devre dÄ±ÅŸÄ±.");
}

// Support both GITHUB_ID/GITHUB_SECRET and GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET
const GH_ID = process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID;
const GH_SECRET = process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET;
if (GH_ID && GH_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: GH_ID,
      clientSecret: GH_SECRET,
    })
  );
} else {
  console.warn("[auth] GitHub env eksik, GitHub provider devre dÄ±ÅŸÄ±.");
}

export const authOptions: NextAuthOptions = {
  trustHost: true,
  debug: process.env.NEXTAUTH_DEBUG === "true",
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    ...providers,
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        try {
          await dbConnect();
          const email = String(creds?.email || "").toLowerCase().trim();
          const password = String(creds?.password || "");
          if (!email || !password) return null;
          const u: any = await User.findOne({ email }).lean();
          if (!u?.password) return null;
          const ok = await bcrypt.compare(password, u.password);
          if (!ok) return null;
          return {
            id: String(u._id),
            name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
            email: u.email,
          } as any;
        } catch (e) {
          console.error("[auth] credentials authorize failed", e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user?.email) return false;
        await dbConnect();
        const email = String(user.email).toLowerCase();
        const existing = await User.findOne({ email }).lean();
        if (!existing) {
          const full = user.name || (profile as any)?.name || "";
          const parts = full.trim().split(/\s+/);
          const firstName = parts[0] || "";
          const lastName = parts.slice(1).join(" ") || "";
          const doc: any = {
            firstName,
            lastName,
            email,
            isVerified: true,
            mustCompleteProfile: true,
            roles: ["user"],
          };
          if (account?.provider === "google") (doc as any).googleId = user.id as any;
          if (account?.provider === "github") (doc as any).githubId = user.id as any;
          await User.create(doc);
        }
        return true;
      } catch (e) {
        console.error("[auth] signIn callback failed", e);
        return false;
      }
    },
    async jwt({ token, trigger, session }) {
      // If client requests session update (e.g., after onboarding), sync flag on token
      if (trigger === 'update' && session && typeof (session as any).mustCompleteProfile !== 'undefined') {
        (token as any).mustCompleteProfile = (session as any).mustCompleteProfile;
      }
      try {
        if (token?.email) {
          await dbConnect();
          const u: any = await User.findOne({ email: String(token.email).toLowerCase() })
            .select("_id mustCompleteProfile")
            .lean();
          if (u) {
            (token as any).uid = String(u._id);
            (token as any).mustCompleteProfile = !!u.mustCompleteProfile;
          }
        }
      } catch {}
      return token;
    },
    async session({ session, token }) {
      (session as any).user.id = (token as any).uid;
      (session as any).user.mustCompleteProfile = (token as any).mustCompleteProfile;
      return session;
    },
  },
};


