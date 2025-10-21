// src/lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider  from "next-auth/providers/github";
import Credentials     from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { dbConnect } from "./db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "online",
          scope: "openid email profile",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
    Credentials({
  name: "Credentials",
  credentials: { email: {}, password: {} },
      async authorize(creds) {
        await dbConnect();
        const email = String(creds?.email || "").toLowerCase();
        const pass  = String(creds?.password || "");

        const u = await User.findOne({ email }).select("+password isVerified mustCompleteProfile firstName lastName").lean();
        if (!u || !u.password) return null;

        const ok = await bcrypt.compare(pass, u.password);
        if (!ok) return null;

        if (!u.isVerified) {
          // login sayfasında ?error=EmailNotVerified olarak yakalarsın
          throw new Error("EmailNotVerified");
        }

        return {
          id: String(u._id),
          email: u.email,
          name: `${u.firstName} ${u.lastName}`,
          mustCompleteProfile: u.mustCompleteProfile ?? false,
        } as any;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Credentials: normal akış
      if (account?.provider === "credentials") return true;

      // OAuth: ilk gelişte user yarat ya da bağla
      await dbConnect();
      const email = (user.email || "").toLowerCase();
      if (!email) return false;

      const existing = await User.findOne({ email }).select("_id googleId githubId").lean();
      if (!existing) {
        const full = (user.name || "New User").trim();
        const [firstName, ...rest] = full.split(/\s+/);
        const lastName = rest.join(" ") || "User";

        await User.create({
          firstName: firstName || "New",
          lastName,
          email,
          isVerified: true,
          mustCompleteProfile: true,          // Onboarding zorunlu
          profilePic: (profile as any)?.picture || undefined,
          googleId: account?.provider === "google" ? account.providerAccountId : undefined,
          githubId: account?.provider === "github" ? account.providerAccountId : undefined,
          roles: ["user"],
        });
      } else {
        // Bağlı değilse provider id’yi kaydet (opsiyonel)
        if (account?.provider === "google"  && !existing.googleId)
          await User.updateOne({ _id: existing._id }, { $set: { googleId: account.providerAccountId } });
        if (account?.provider === "github"  && !existing.githubId)
          await User.updateOne({ _id: existing._id }, { $set: { githubId: account.providerAccountId } });
      }

      return true;
    },

    async jwt({ token, account, user, profile }) {
      // token.sub = userId
      if (!token?.sub) return token;

      await dbConnect();
      const u = await User.findById(token.sub)
        .select("mustCompleteProfile firstName lastName email")
        .lean();

      (token as any).mustCompleteProfile = u?.mustCompleteProfile ?? false;

      // OAuth signin anında, register-prefill için info’yu token’a koy
      if (account && (account.provider === "google" || account.provider === "github")) {
        (token as any).oauthNew   = !u || !!u?.mustCompleteProfile; // “ilk geliş”/tamamlanmamış profil
        (token as any).oauthName  = user?.name || (profile as any)?.name || [ (profile as any)?.given_name, (profile as any)?.family_name ].filter(Boolean).join(" ") || "";
        (token as any).oauthEmail = u?.email || user?.email || (profile as any)?.email || "";
      }

      return token;
    },

    async session({ session, token }) {
      (session as any).user.id = token.sub;
      (session as any).user.mustCompleteProfile = (token as any).mustCompleteProfile ?? false;
      (session as any).oauth = {
        isNew: !!(token as any).oauthNew,
        name: (token as any).oauthName || null,
        email: (token as any).oauthEmail || session.user.email || null,
      };
      return session;
    },

    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        return u.toString();
      } catch {
        return baseUrl;
      }
    },
  },

  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
