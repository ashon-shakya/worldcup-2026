"use server";

import connectToDatabase from "@/lib/db";
import { Prediction, User, Match, Group } from "@/models/schema";

export async function getGlobalLeaderboard() {
    await connectToDatabase();

    const leaderboard = await Prediction.aggregate([
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
            $match: {
                "userInfo.optOutGlobal": { $ne: true }
            }
        },
        {
            $project: {
                _id: 1,
                name: "$userInfo.name",
                nickname: "$userInfo.nickname",
                image: "$userInfo.image",
                email: "$userInfo.email", // Optional, maybe masked or removed for privacy in real app
                totalPoints: 1
            }
        }
    ]);

    return JSON.parse(JSON.stringify(leaderboard));
}

export async function getLeaderboardTimeline(groupId?: string) {
    await connectToDatabase();

    let userFilter: any = {};
    let matchFilter: any = { status: "FINISHED" };
    let stageMultipliers: Record<string, number> = {};

    if (groupId) {
        const group = await Group.findById(groupId);
        if (!group) return { users: [], steps: [] };

        userFilter = { _id: { $in: group.members } };
        const stagesToInclude = group.includedStages && group.includedStages.length > 0
            ? group.includedStages
            : ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "3rd Place", "Final"];
        matchFilter.stage = { $in: stagesToInclude };
        stageMultipliers = group.stageMultipliers || {};
    } else {
        userFilter = { optOutGlobal: { $ne: true } };
    }

    // Fetch relevant users
    const users = await User.find(userFilter, "name nickname image");
    const userIds = users.map(u => u._id.toString());

    // Fetch finished matches, sorted by kickOff ascending
    const matches = await Match.find(matchFilter)
        .populate("homeTeam", "name flagUrl")
        .populate("awayTeam", "name flagUrl")
        .sort({ kickOff: 1 });

    if (matches.length === 0) {
        return { users: JSON.parse(JSON.stringify(users)), steps: [] };
    }

    const matchIds = matches.map(m => m._id);

    const matchStageMap = new Map<string, string>();
    matches.forEach(m => {
        matchStageMap.set(m._id.toString(), m.stage);
    });

    // Fetch all predictions for these users and matches
    const predictions = await Prediction.find({
        match: { $in: matchIds },
        user: { $in: userIds }
    }, "user match points");

    // Group predictions by matchId and userId
    const predictionPointsMap = new Map<string, Map<string, number>>();
    predictions.forEach(p => {
        const mId = p.match.toString();
        const uId = p.user.toString();
        let pts = p.points || 0;
        if (groupId) {
            const stage = matchStageMap.get(mId) || "";
            const mult = typeof stageMultipliers[stage] === "number" ? stageMultipliers[stage] : 1;
            pts = pts * mult;
        }

        if (!predictionPointsMap.has(mId)) {
            predictionPointsMap.set(mId, new Map());
        }
        predictionPointsMap.get(mId)!.set(uId, pts);
    });

    // Initialize running scores
    const runningScores: Record<string, number> = {};
    userIds.forEach(uid => {
        runningScores[uid] = 0;
    });

    // Construct steps
    const steps = matches.map((match) => {
        const mId = match._id.toString();
        const pointsMap = predictionPointsMap.get(mId);

        // Update running scores
        userIds.forEach(uid => {
            const pts = pointsMap?.get(uid) || 0;
            runningScores[uid] += pts;
        });

        return {
            matchId: mId,
            homeTeam: {
                name: match.homeTeam?.name,
                flagUrl: match.homeTeam?.flagUrl
            },
            awayTeam: {
                name: match.awayTeam?.name,
                flagUrl: match.awayTeam?.flagUrl
            },
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            kickOff: match.kickOff.toISOString(),
            stage: match.stage,
            scores: { ...runningScores }
        };
    });

    return {
        users: JSON.parse(JSON.stringify(users)),
        steps: JSON.parse(JSON.stringify(steps))
    };
}

