"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/schema";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

const SignupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email(),
    password: z.string().min(6, "Minimum 6 characters"),
});

export async function authenticate(prevState: string | undefined, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = LoginSchema.safeParse(data);

    if (!parsed.success) {
        return "Invalid credentials";
    }

    const { email, password } = parsed.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard"
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}

export async function signup(prevState: string | undefined, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = SignupSchema.safeParse(data);

    if (!parsed.success) {
        return "Invalid input";
    }

    const { name, email, password } = parsed.data;

    try {
        await connectToDatabase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return "User already exists";
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = await generateVerificationToken(email);
        await sendVerificationEmail(email, token);

        return "success";
    } catch (error) {
        console.error("Signup error:", error);
        return "Failed to create user";
    }
}
