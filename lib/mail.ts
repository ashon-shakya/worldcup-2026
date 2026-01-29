import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    const confirmLink = `${domain}/verify-email?token=${token}`;

    await resend.emails.send({
        from: "onboarding@resend.dev", // Update this with your verified domain in production
        to: email,
        subject: "Confirm your email",
        html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email.</p>`
    });
};
