"use server";

import { auth } from "@/auth";
import { Match, Prediction, Team } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

const PredictionSchema = z.object({
    matchId: z.string(),
    homeScore: z.coerce.number().min(0),
    awayScore: z.coerce.number().min(0),
    penaltyPrediction: z.coerce.boolean().optional(),
    predictedWinner: z.string().optional(),
});

export async function submitPrediction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || !session.user) {
        return { message: "Unauthorized" };
    }

    const data = Object.fromEntries(formData);
    const parsed = PredictionSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid prediction" };
    }

    const { matchId, homeScore, awayScore, penaltyPrediction, predictedWinner } = parsed.data;

    try {
        await connectToDatabase();

        // Check if match exists and is not started/locked
        const match = await Match.findById(matchId);
        if (!match) return { message: "Match not found" };

        const now = new Date();
        // Lock 5 mins before kickoff
        const lockTime = new Date(match.kickOff.getTime() - 5 * 60000);

        if (now > lockTime) {
            return { message: "Predictions are locked for this match" };
        }

        // Enforce penalty prediction only if it's a draw
        const isKnockoutStage = ["Round of 32", "Round of 16", "Quarter Final", "Semi Final", "Final", "3rd Place"].includes(match.stage);
        const isKnockout = match.isKnockout || isKnockoutStage;

        const isDraw = homeScore === awayScore;

        if (isKnockout && isDraw) {
            if (!predictedWinner || predictedWinner.trim() === "") {
                return { message: "You must select a winner for penalty shootout in knockout matches" };
            }
        }

        const finalPenaltyPrediction = isDraw ? (isKnockout ? true : !!penaltyPrediction) : false;
        const finalPredictedWinner = isDraw && finalPenaltyPrediction && predictedWinner && predictedWinner.trim() !== "" ? predictedWinner : null;

        // Upsert prediction
        await Prediction.findOneAndUpdate(
            { user: session.user.id, match: matchId },
            {
                user: session.user.id,
                match: matchId,
                homeScore,
                awayScore,
                penaltyPrediction: finalPenaltyPrediction,
                predictedWinner: finalPredictedWinner
            },
            { upsert: true, new: true }
        );

        revalidatePath("/dashboard/matches");
        revalidatePath("/dashboard");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to submit prediction:", error);
        return { message: "Failed to submit prediction" };
    }
}

export async function getUserPredictions(userId: string) {
    noStore();
    await connectToDatabase();
    const predictions = await Prediction.find({ user: userId });
    // Return as a map or array. Map is easier for looking up by matchId.
    const predictionMap: Record<string, any> = {};
    predictions.forEach(p => {
        predictionMap[p.match.toString()] = {
            homeScore: p.homeScore,
            awayScore: p.awayScore,
            penaltyPrediction: p.penaltyPrediction,
            predictedWinner: p.predictedWinner,
            points: p.points
        };
    });
    return predictionMap;
}

export async function getPublicPredictions(userId: string) {
    noStore();
    await connectToDatabase();

    const predictions = await Prediction.find({ user: userId })
        .populate({
            path: "match",
            populate: [
                { path: "homeTeam", model: "Team" },
                { path: "awayTeam", model: "Team" },
                { path: "winner", model: "Team" }
            ]
        })
        .populate("predictedWinner");

    const now = new Date();

    // Predictions are viewable once locked (5 mins before kickoff)
    const publicPredictions = predictions.filter((p: any) => {
        if (!p.match) return false;
        const kickOffTime = new Date(p.match.kickOff);
        const lockTime = new Date(kickOffTime.getTime() - 5 * 60000);
        return now > lockTime || p.match.status === "LIVE" || p.match.status === "FINISHED";
    });

    // Sort predictions in descending order of kickOff time
    publicPredictions.sort((a: any, b: any) => {
        return new Date(b.match.kickOff).getTime() - new Date(a.match.kickOff).getTime();
    });

    return JSON.parse(JSON.stringify(publicPredictions));
}

export async function getTeamMatches(teamId: string) {
    await connectToDatabase();
    const matches = await Match.find({
        $or: [
            { homeTeam: teamId },
            { awayTeam: teamId }
        ]
    })
    .populate("homeTeam", "name shortName flagUrl")
    .populate("awayTeam", "name shortName flagUrl")
    .sort({ kickOff: -1 });

    return JSON.parse(JSON.stringify(matches));
}

