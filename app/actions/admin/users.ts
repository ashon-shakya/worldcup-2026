"use server";

import { User } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sort?: string;
    order?: "asc" | "desc";
} = {}) {
    await connectToDatabase();

    const {
        page = 1,
        limit = 10,
        search = "",
        role = "",
        sort = "createdAt",
        order = "desc",
    } = options;

    const query: any = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    if (role && role !== "ALL") {
        query.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments(query);

    return {
        users: JSON.parse(JSON.stringify(users)),
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit,
        },
    };
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
