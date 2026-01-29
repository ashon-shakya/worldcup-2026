"use server";

import connectToDatabase from "@/lib/db";
import { Group, Prediction, User } from "@/models/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const CreateGroupSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
});

const JoinGroupSchema = z.object({
    code: z.string().min(1, "Code is required"),
});

export async function createGroup(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || !session.user) return { message: "Unauthorized" };

    const data = Object.fromEntries(formData);
    const parsed = CreateGroupSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid input" };
    }

    const { name } = parsed.data;

    try {
        await connectToDatabase();

        let code = generateCode();
        // Simple collision check (optional but good)
        let existing = await Group.findOne({ code });
        while (existing) {
            code = generateCode();
            existing = await Group.findOne({ code });
        }

        const newGroup = await Group.create({
            name,
            code,
            owner: session.user.id,
            members: [session.user.id], // Creator joins automatically
        });

        revalidatePath("/dashboard/groups");
        return { message: "success", groupId: newGroup._id.toString() };
    } catch (error) {
        console.error("Failed to create group:", error);
        return { message: "Failed to create group" };
    }
}

export async function joinGroup(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || !session.user) return { message: "Unauthorized" };

    const data = Object.fromEntries(formData);
    const parsed = JoinGroupSchema.safeParse(data);

    if (!parsed.success) return { message: "Invalid code" };

    const { code } = parsed.data;

    try {
        await connectToDatabase();
        const group = await Group.findOne({ code: code.toUpperCase() });

        if (!group) return { message: "Group not found" };

        // Check if already a member
        if (group.members.includes(session.user.id)) {
            return { message: "You are already a member of this group" };
        }

        group.members.push(session.user.id);
        await group.save();

        revalidatePath("/dashboard/groups");
        return { message: "success", groupId: group._id.toString() };
    } catch (error) {
        console.error("Failed to join group:", error);
        return { message: "Failed to join group" };
    }
}

export async function getUserGroups() {
    const session = await auth();
    if (!session || !session.user) return [];

    await connectToDatabase();
    // Find groups where members array contains user id
    const groups = await Group.find({ members: session.user.id }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(groups));
}

export async function getGroupDetails(groupId: string) {
    await connectToDatabase();

    // Get group info
    const group = await Group.findById(groupId).populate("members", "name image");
    if (!group) return null;

    // Calculate leaderboard for these members ONLY
    const memberIds = group.members.map((m: any) => m._id);

    const leaderboard = await Prediction.aggregate([
        {
            $match: {
                user: { $in: memberIds }
            }
        },
        {
            $group: {
                _id: "$user",
                totalPoints: { $sum: "$points" }
            }
        },
        {
            $sort: { totalPoints: -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        {
            $unwind: "$userInfo"
        },
        {
            $project: {
                _id: 1,
                name: "$userInfo.name",
                image: "$userInfo.image",
                totalPoints: 1
            }
        }
    ]);

    // Ensure all members are in the leaderboard (even with 0 points)
    const leaderboardMap = new Map(leaderboard.map((l: any) => [l._id.toString(), l]));

    const fullLeaderboard = group.members.map((member: any) => {
        const stats = leaderboardMap.get(member._id.toString());
        return {
            _id: member._id.toString(),
            name: member.name,
            image: member.image,
            totalPoints: stats ? stats.totalPoints : 0
        };
    }).sort((a: any, b: any) => b.totalPoints - a.totalPoints);

    return {
        group: JSON.parse(JSON.stringify(group)),
        leaderboard: fullLeaderboard
    };
}

export async function deleteGroup(groupId: string) {
    const session = await auth();
    if (!session || !session.user) return { message: "Unauthorized" };

    try {
        await connectToDatabase();
        const group = await Group.findById(groupId);

        if (!group) return { message: "Group not found" };

        if (group.owner.toString() !== session.user.id) {
            return { message: "Only the group owner can delete this group" };
        }

        await Group.findByIdAndDelete(groupId);
        revalidatePath("/dashboard/groups");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to delete group:", error);
        return { message: "Failed to delete group" };
    }
}
