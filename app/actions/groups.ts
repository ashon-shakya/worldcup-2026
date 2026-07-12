"use server";

import connectToDatabase from "@/lib/db";
import { Group, Prediction, User, Match } from "@/models/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const CreateGroupSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
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

    const { name, description } = parsed.data;

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
            description: description || "",
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
    const group = await Group.findById(groupId).populate("members", "name nickname image");
    if (!group) return null;

    // Calculate leaderboard for these members ONLY
    const memberIds = group.members.map((m: any) => m._id);

    // Default to all stages if includedStages is missing or empty
    const stagesToInclude = group.includedStages && group.includedStages.length > 0
        ? group.includedStages
        : ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "3rd Place", "Final"];

    const validStages = ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "3rd Place", "Final"];
    const stageMultipliers = group.stageMultipliers || {};
    const branches = validStages.map(stage => ({
        case: { $eq: ["$matchInfo.stage", stage] },
        then: typeof stageMultipliers[stage] === "number" ? stageMultipliers[stage] : 1
    }));
    const multiplierExpr = {
        $switch: {
            branches,
            default: 1
        }
    };

    const leaderboard = await Prediction.aggregate([
        {
            $match: {
                user: { $in: memberIds }
            }
        },
        {
            $lookup: {
                from: "matches",
                localField: "match",
                foreignField: "_id",
                as: "matchInfo"
            }
        },
        {
            $unwind: "$matchInfo"
        },
        {
            $match: {
                "matchInfo.stage": { $in: stagesToInclude }
            }
        },
        {
            $group: {
                _id: "$user",
                totalPoints: {
                    $sum: {
                        $multiply: ["$points", multiplierExpr]
                    }
                }
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
                nickname: "$userInfo.nickname",
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
            nickname: member.nickname,
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

export async function removeGroupMember(groupId: string, memberId: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) return { message: "Unauthorized" };

    try {
        await connectToDatabase();
        const group = await Group.findById(groupId);

        if (!group) return { message: "Group not found" };

        if (group.owner.toString() !== session.user.id.toString()) {
            return { message: "Only the group owner can remove members" };
        }

        if (memberId.toString() === group.owner.toString()) {
            return { message: "You cannot remove the group owner" };
        }

        group.members = group.members.filter((m: any) => m.toString() !== memberId.toString());
        await group.save();

        revalidatePath(`/dashboard/groups/${groupId}`);
        return { message: "success" };
    } catch (error) {
        console.error("Failed to remove group member:", error);
        return { message: "Failed to remove group member" };
    }
}

export async function updateGroupSettings(groupId: string, stages: string[], multipliers: Record<string, number>, color: string | null, textColor: string | null, description?: string) {
    const session = await auth();
    if (!session || !session.user) return { message: "Unauthorized" };

    try {
        await connectToDatabase();
        const group = await Group.findById(groupId);
        if (!group) return { message: "Group not found" };

        if (group.owner.toString() !== session.user.id) {
            return { message: "Only the group owner can modify settings" };
        }

        const validStages = ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "3rd Place", "Final"];
        const filteredStages = stages.filter(s => validStages.includes(s));

        if (filteredStages.length === 0) {
            return { message: "You must include at least one round" };
        }

        // Sanitize multipliers: ensure they are positive numbers or default to 1
        const cleanedMultipliers: Record<string, number> = {};
        validStages.forEach(stage => {
            const m = multipliers?.[stage];
            cleanedMultipliers[stage] = (typeof m === "number" && m >= 0) ? m : 1;
        });

        group.includedStages = filteredStages;
        group.stageMultipliers = cleanedMultipliers;
        group.color = color;
        group.textColor = textColor;
        group.description = description || "";
        await group.save();

        revalidatePath(`/dashboard/groups/${groupId}`);
        revalidatePath("/dashboard/groups");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to update group settings:", error);
        return { message: "Failed to update group settings" };
    }
}

export async function getGroupFinishedMatchesPredictions(groupId: string, page: number = 1) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    await connectToDatabase();

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(session.user.id)) {
        throw new Error("Unauthorized or group not found");
    }

    const stagesToInclude = group.includedStages && group.includedStages.length > 0
        ? group.includedStages
        : ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "3rd Place", "Final"];

    const limit = 10;
    const skip = (page - 1) * limit;

    // Fetch matches that have started in included stages, sorted by kickoff descending
    const now = new Date();
    const matchQuery = {
        $and: [
            { stage: { $in: stagesToInclude } },
            {
                $or: [
                    { status: { $in: ["LIVE", "FINISHED"] } },
                    { kickOff: { $lt: now } }
                ]
            }
        ]
    };

    const [matches, totalMatches] = await Promise.all([
        Match.find(matchQuery)
            .sort({ kickOff: -1 })
            .skip(skip)
            .limit(limit)
            .populate("homeTeam awayTeam"),
        Match.countDocuments(matchQuery)
    ]);

    const matchIds = matches.map(m => m._id);

    const matchStageMap = new Map<string, string>();
    matches.forEach(m => {
        matchStageMap.set(m._id.toString(), m.stage);
    });

    // Fetch predictions of all members for these matches
    const predictions = await Prediction.find({
        match: { $in: matchIds },
        user: { $in: group.members }
    });

    const stageMultipliers = group.stageMultipliers || {};

    // Structure predictions by matchId and userId
    const predictionsMap: Record<string, Record<string, any>> = {};
    predictions.forEach((p) => {
        const mId = p.match.toString();
        const uId = p.user.toString();
        const stage = matchStageMap.get(mId) || "";
        const mult = typeof stageMultipliers[stage] === "number" ? stageMultipliers[stage] : 1;
        const multipliedPoints = (p.points || 0) * mult;

        if (!predictionsMap[mId]) {
            predictionsMap[mId] = {};
        }
        predictionsMap[mId][uId] = {
            homeScore: p.homeScore,
            awayScore: p.awayScore,
            points: multipliedPoints,
            penaltyPrediction: p.penaltyPrediction,
            predictedWinner: p.predictedWinner ? p.predictedWinner.toString() : null
        };
    });

    return {
        matches: JSON.parse(JSON.stringify(matches)),
        predictionsMap,
        totalMatches,
        totalPages: Math.ceil(totalMatches / limit)
    };
}
