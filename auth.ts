import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/schema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    await connectToDatabase();
                    const user = await User.findOne({ email }).select("+password");

                    if (!user) return null;
                    if (!user.password) return null; // User might have signed up with social provider

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        image: user.image,
                    };
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
});
