"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/schema";
import bcrypt from "bcryptjs";
import { generateVerificationToken, generatePasswordResetToken } from "@/lib/tokens";
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

export async function authenticate(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = LoginSchema.safeParse(data);

    if (!parsed.success) {
        return { error: "Invalid credentials" };
    }

    const { email, password } = parsed.data;

    try {
        await connectToDatabase();
        const user = await User.findOne({ email });

        if (user && !user.emailVerified) {
            return {
                error: "Please verify your email before logging in.",
                code: "VERIFY_EMAIL",
                email: email
            };
        }

        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard"
        });

        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials." };
                default:
                    return { error: "Something went wrong." };
            }
        }
        throw error;
    }
}

export async function resendVerificationEmail(email: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ email });

        if (!user) {
            return { error: "User not found" };
        }

        if (user.emailVerified) {
            return { error: "Email already verified" };
        }

        const token = await generateVerificationToken(email);
        await sendVerificationEmail(email, token);

        return { success: "Verification email sent!" };
    } catch (error) {
        console.error("Resend verification error:", error);
        return { error: "Failed to send verification email" };
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

export async function logout() {
    await signOut({ redirectTo: "/login" });
}

const ForgotPasswordSchema = z.object({
    email: z.string().email(),
});

export async function forgotPassword(prevState: string | undefined, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = ForgotPasswordSchema.safeParse(data);

    if (!parsed.success) {
        return "Invalid email";
    }

    const { email } = parsed.data;

    try {
        await connectToDatabase();
        const user = await User.findOne({ email });

        if (user) {
            // Check if user is using a social provider
            if (user.provider && user.provider !== "credentials") {
                return "This email is associated with a social login.";
            }

            const token = await generatePasswordResetToken(email);
            // Wait for the token generation and then send email
            // Re-import to avoid circular dependency issues if any, 
            // though here modules should be fine.
            const { sendPasswordResetEmail } = await import("@/lib/mail");
            await sendPasswordResetEmail(email, token);
        }

        // Always return success to avoid enumerating emails
        return "success";
    } catch (error) {
        console.error("Forgot password error:", error);
        return "Something went wrong";
    }
}

const ResetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string().min(6, "Minimum 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export async function resetPassword(prevState: string | undefined, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = ResetPasswordSchema.safeParse(data);

    if (!parsed.success) {
        return parsed.error.issues[0].message;
    }

    const { token, password } = parsed.data;

    try {
        await connectToDatabase();
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return "Invalid or expired token";
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpires = undefined;
        await user.save();

        return "success";
    } catch (error) {
        console.error("Reset password error:", error);
        return "Failed to reset password";
    }
}
