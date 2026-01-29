"use server";

import { User } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUsers() {
    await connectToDatabase();
    const users = await User.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(users));
}

export async function updateUserRole(userId: string, newRole: "USER" | "ADMIN") {
    try {
        await connectToDatabase();
        await User.findByIdAndUpdate(userId, { role: newRole });
        revalidatePath("/admin/users");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to update user role:", error);
        return { message: "Failed to update role" };
    }
}

export async function deleteUser(userId: string) {
    try {
        await connectToDatabase();
        await User.findByIdAndDelete(userId);
        revalidatePath("/admin/users");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { message: "Failed to delete user" };
    }
}
