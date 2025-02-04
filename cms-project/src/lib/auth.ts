import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";

interface ExtendedToken extends JWT {
    id?: string;
    email?: string;
    name?: string;
}

export const authOptions: NextAuthOptions = {
    debug: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error("Invalid email or password");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    throw new Error("Invalid email or password");
                }

                return { id: user.id, name: user.name, email: user.email };
            },
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.AUTH_SECRET,
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user, account }): Promise<JWT> {
            if (user) {
                token.id = user.id ?? "";
                token.email = user.email ?? "";
                token.name = user.name ?? "";
            }

            return token;
        },

        async session({ session, token }) {
            session.user = {
                ...session.user,
                id: token.id as string,
            };
            return session;
        },

        async redirect({ url, baseUrl }) {
            return url.startsWith(baseUrl) ? url : baseUrl;
        },
    },
};