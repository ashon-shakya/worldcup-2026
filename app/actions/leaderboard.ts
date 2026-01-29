"use server";

import connectToDatabase from "@/lib/db";
import { Prediction } from "@/models/schema";

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
            $project: {
                _id: 1,
                name: "$userInfo.name",
                image: "$userInfo.image",
                email: "$userInfo.email", // Optional, maybe masked or removed for privacy in real app
                totalPoints: 1
            }
        }
    ]);

    return JSON.parse(JSON.stringify(leaderboard));
}
