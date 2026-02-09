import nodemailer from "nodemailer";
import { getEmailTemplate } from "./email-templates";

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    const confirmLink = `${domain}/verify-email?token=${token}`;

    const html = getEmailTemplate({
        url: confirmLink,
        subject: "Confirm your email - CupQuest",
        previewText: "Welcome to CupQuest! Please verify your email address to get started.",
        title: "Verify your email address",
        message: "Thanks for signing up for CupQuest! We're excited to have you on board. Please verify your email address by clicking the button below to complete your registration.",
        buttonText: "Verify Email"
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CupQuest" <no-reply@cupquest.com>',
        to: email,
        subject: "Confirm your email - CupQuest",
        html: html,
    });
};

export const sendPasswordResetEmail = async (
    email: string,
    token: string
) => {
    const resetLink = `${domain}/reset-password?token=${token}`;

    const html = getEmailTemplate({
        url: resetLink,
        subject: "Reset your password - CupQuest",
        previewText: "You have requested to reset your password.",
        title: "Reset your password",
        message: "We received a request to reset your password. If you didn't make this request, you can safely ignore this email. Otherwise, click the button below to reset your password.",
        buttonText: "Reset Password"
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CupQuest" <no-reply@cupquest.com>',
        to: email,
        subject: "Reset your password - CupQuest",
        html: html,
    });
};
