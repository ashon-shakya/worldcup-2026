"use server";

import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/schema";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfileImage(formData: FormData) {
    const session = await auth();
    if (!session || !session.user) {
        return { error: "Unauthorized" };
    }

    const file = formData.get("image") as File;
    if (!file) {
        return { error: "No image provided" };
    }

    // Check file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
        return { error: "Image size must be less than 1MB" };
    }

    try {
        await connectToDatabase();

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult: any = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "worldcup-2026/profiles",
                        public_id: session.user?.id,
                        overwrite: true,
                        transformation: [{ width: 500, height: 500, crop: "fill" }],
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                )
                .end(buffer);
        });

        await User.findByIdAndUpdate(session.user.id, {
            image: uploadResult.secure_url,
        });

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard"); // To update nav bar

        return { success: true, imageUrl: uploadResult.secure_url };
    } catch (error) {
        console.error("Image upload error:", error);
        return { error: "Failed to upload image" };
    }
}

export async function updatePassword(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || !session.user) {
        return { error: "Unauthorized" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All fields are required" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" };
    }

    try {
        await connectToDatabase();
        const user = await User.findById(session.user.id).select("+password");

        if (!user || !user.password) {
            return { error: "User not found or no password set" };
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return { error: "Incorrect current password" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(session.user.id, {
            password: hashedPassword,
        });

        revalidatePath("/dashboard/settings");

        return { success: true };
    } catch (error) {
        console.error("Password update error:", error);
        return { error: "Failed to update password" };
    }
}
