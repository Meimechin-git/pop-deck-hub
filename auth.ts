// auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub,
    // メール/パスワード認証の設定
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. ユーザーをDBから探す
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // ユーザーがいない、またはパスワード未設定（GitHubユーザー等）の場合はエラー
        if (!user || !user.password) return null;

        // 2. パスワードが正しいか照合
        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (isMatch) {
          return user; // 認証成功！
        }
        return null; // 認証失敗
      },
    }),
  ],
  callbacks: {
    // 1. ログイン時に、ユーザーIDをトークン(JWT)に書き込む
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // 2. 画面やAPIで使うセッション情報に、トークンからIDを書き写す
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
})