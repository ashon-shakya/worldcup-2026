"use server";

import { auth } from "@/auth";
import { Match, Prediction, Team } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import { isKnockoutStage } from "@/lib/constants";
import { getPointSettings } from "@/app/actions/admin/settings";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { z } from "zod";
import { isEventEnabled } from "@/lib/scoring";

const PredictionSchema = z.object({
    matchId: z.string(),
    homeScore: z.coerce.number().min(0),
    awayScore: z.coerce.number().min(0),
    penaltyPrediction: z.coerce.boolean().optional(),
    predictedWinner: z.string().optional(),
    spRedCards: z.preprocess(val => val === "" || val === "none" ? null : val === "true" || val === true, z.boolean().nullable()).optional(),
    spTotalCards: z.preprocess(val => val === "" || val === "none" ? null : val, z.enum(["UNDER", "OVER"]).nullable()).optional(),
    spExtraTime: z.preprocess(val => val === "" || val === "none" ? null : val === "true" || val === true, z.boolean().nullable()).optional(),
    spInGamePenalty: z.preprocess(val => val === "" || val === "none" ? null : val === "true" || val === true, z.boolean().nullable()).optional(),
    spOwnGoal: z.preprocess(val => val === "" || val === "none" ? null : val === "true" || val === true, z.boolean().nullable()).optional(),
    spFirstTeamToScore: z.preprocess(val => val === "" || val === "none" ? null : val, z.string().nullable()).optional(),
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

    const {
        matchId,
        homeScore,
        awayScore,
        penaltyPrediction,
        predictedWinner,
        spRedCards,
        spTotalCards,
        spExtraTime,
        spInGamePenalty,
        spOwnGoal,
        spFirstTeamToScore
    } = parsed.data;

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
        const isKnockout = match.isKnockout || isKnockoutStage(match.stage);

        const isDraw = homeScore === awayScore;

        if (isKnockout && isDraw) {
            if (!predictedWinner || predictedWinner.trim() === "") {
                return { message: "You must select a winner for penalty shootout in knockout matches" };
            }
        }

        const finalPenaltyPrediction = isDraw ? (isKnockout ? true : !!penaltyPrediction) : false;
        const finalPredictedWinner = isDraw && finalPenaltyPrediction && predictedWinner && predictedWinner.trim() !== "" ? predictedWinner : null;

        // Fetch settings to check if special predictions are enabled for this stage and specific events
        const settings = await getPointSettings();

        const finalSpRedCards = isEventEnabled(match.stage, "spRedCards", settings) ? (spRedCards !== undefined ? spRedCards : null) : null;
        const finalSpTotalCards = isEventEnabled(match.stage, "spTotalCards", settings) ? (spTotalCards !== undefined ? spTotalCards : null) : null;
        const finalSpExtraTime = isEventEnabled(match.stage, "spExtraTime", settings) ? (spExtraTime !== undefined ? spExtraTime : null) : null;
        const finalSpInGamePenalty = isEventEnabled(match.stage, "spInGamePenalty", settings) ? (spInGamePenalty !== undefined ? spInGamePenalty : null) : null;
        const finalSpOwnGoal = isEventEnabled(match.stage, "spOwnGoal", settings) ? (spOwnGoal !== undefined ? spOwnGoal : null) : null;
        const finalSpFirstTeamToScore = isEventEnabled(match.stage, "spFirstTeamToScore", settings) ? (spFirstTeamToScore !== undefined ? spFirstTeamToScore : null) : null;

        // Upsert prediction
        await Prediction.findOneAndUpdate(
            { user: session.user.id, match: matchId },
            {
                user: session.user.id,
                match: matchId,
                homeScore,
                awayScore,
                penaltyPrediction: finalPenaltyPrediction,
                predictedWinner: finalPredictedWinner,
                spRedCards: finalSpRedCards,
                spTotalCards: finalSpTotalCards,
                spExtraTime: finalSpExtraTime,
                spInGamePenalty: finalSpInGamePenalty,
                spOwnGoal: finalSpOwnGoal,
                spFirstTeamToScore: finalSpFirstTeamToScore,
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
            points: p.points,
            spRedCards: p.spRedCards,
            spTotalCards: p.spTotalCards,
            spExtraTime: p.spExtraTime,
            spInGamePenalty: p.spInGamePenalty,
            spOwnGoal: p.spOwnGoal,
            spFirstTeamToScore: p.spFirstTeamToScore,
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
                { path: "winner", model: "Team" },
                { path: "spFirstTeamToScore", model: "Team" }
            ]
        })
        .populate("predictedWinner")
        .populate("spFirstTeamToScore");

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

