"use server";

import { Match } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isKnockoutStage } from "@/lib/constants";
import { z } from "zod";
import { Prediction } from "@/models/schema";
import { calculatePoints, isEventEnabled } from "@/lib/scoring";
import { getPointSettings } from "@/app/actions/admin/settings";
import { auth } from "@/auth";

const MatchSchema = z.object({
    homeTeam: z.string().min(1, "Home team required"),
    awayTeam: z.string().min(1, "Away team required"),
    kickOff: z.coerce.date(),
    venue: z.string().optional(),
    stage: z.string().min(1, "Stage required"),
    isKnockout: z.coerce.boolean().optional(),
    matchHighlights: z.string().optional().default(""),
    priority: z.enum(["normal", "high"]).optional().default("normal"),
});

export async function createMatch(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = MatchSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid input", errors: parsed.error.flatten().fieldErrors };
    }

    const { homeTeam, awayTeam, kickOff, venue, stage, isKnockout, matchHighlights, priority } = parsed.data;

    try {
        await connectToDatabase();
        await Match.create({
            homeTeam,
            awayTeam,
            kickOff,
            venue,
            stage,
            isKnockout: isKnockout || false,
            matchHighlights,
            priority,
        });
        revalidatePath("/admin/matches");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to create match:", error);
        return { message: "Failed to create match" };
    }
}

export async function updateMatch(id: string, prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = MatchSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid input", errors: parsed.error.flatten().fieldErrors };
    }

    const { homeTeam, awayTeam, kickOff, venue, stage, isKnockout, matchHighlights, priority } = parsed.data;

    try {
        await connectToDatabase();
        await Match.findByIdAndUpdate(id, {
            homeTeam,
            awayTeam,
            kickOff,
            venue,
            stage,
            isKnockout: isKnockout || false,
            matchHighlights,
            priority,
        });
        revalidatePath("/admin/matches");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to update match:", error);
        return { message: "Failed to update match" };
    }
}

export async function deleteMatch(id: string) {
    try {
        await connectToDatabase();
        await Prediction.deleteMany({ match: id }); // Delete all predictions for this match
        await Match.findByIdAndDelete(id);
        revalidatePath("/admin/matches");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to delete match:", error);
        return { message: "Failed to delete match" };
    }
}

export async function deleteMatches(ids: string[]) {
    try {
        await connectToDatabase();
        await Prediction.deleteMany({ match: { $in: ids } });
        await Match.deleteMany({ _id: { $in: ids } });
        revalidatePath("/admin/matches");
        return { message: "success", deletedCount: ids.length };
    } catch (error) {
        console.error("Failed to delete matches:", error);
        return { message: "Failed to delete matches" };
    }
}

export async function getMatches() {
    await connectToDatabase();
    const matches = await Match.find({})
        .populate("homeTeam", "name flagUrl")
        .populate("awayTeam", "name flagUrl")
        .populate("penaltyWinner", "name")
        .populate("winner", "_id") // Only need ID to compare
        .sort({ kickOff: -1 });
    return JSON.parse(JSON.stringify(matches));
}

const ScoreSchema = z.object({
    homeScore: z.coerce.number().min(0),
    awayScore: z.coerce.number().min(0),
    wentToPenalties: z.coerce.boolean().optional(),
    penaltyWinner: z.string().optional(),
    spRedCards: z.preprocess(val => val === "true" || val === true, z.boolean()).optional(),
    spTotalCards: z.enum(["UNDER", "OVER"]).optional(),
    spExtraTime: z.preprocess(val => val === "true" || val === true, z.boolean()).optional(),
    spInGamePenalty: z.preprocess(val => val === "true" || val === true, z.boolean()).optional(),
    spOwnGoal: z.preprocess(val => val === "true" || val === true, z.boolean()).optional(),
    spFirstTeamToScore: z.string().optional(),
});

export async function updateMatchScore(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || !session.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "MODERATOR")) {
        return { message: "Unauthorized" };
    }

    const data = Object.fromEntries(formData);
    const parsed = ScoreSchema.safeParse(data);

    if (!parsed.success) {
        console.error("Score validation failed details:", parsed.error.flatten());
        return { message: "Invalid score or special predictions" };
    }

    const {
        homeScore,
        awayScore,
        wentToPenalties,
        penaltyWinner,
        spRedCards,
        spTotalCards,
        spExtraTime,
        spInGamePenalty,
        spOwnGoal,
        spFirstTeamToScore
    } = parsed.data;

    try {
        await connectToDatabase();
        // First get the match to check stage if isKnockout is missing
        const existingMatch = await Match.findById(id);
        const isKnockout = existingMatch?.isKnockout || isKnockoutStage(existingMatch?.stage);

        // Determine winner logic
        let winnerId = null;
        if (homeScore > awayScore) {
            winnerId = existingMatch.homeTeam;
        } else if (awayScore > homeScore) {
            winnerId = existingMatch.awayTeam;
        } else if (!!wentToPenalties && penaltyWinner) {
            winnerId = penaltyWinner;
        }

        // Fetch point settings
        const settings = await getPointSettings();

        const updateFields: any = {
            homeScore,
            awayScore,
            status: "FINISHED",
            wentToPenalties: !!wentToPenalties,
            penaltyWinner: penaltyWinner || null,
            winner: winnerId,
            // Ensure isKnockout is set if it wasn't
            isKnockout: existingMatch?.isKnockout || isKnockout,
            spRedCards: isEventEnabled(existingMatch.stage, "spRedCards", settings) ? (spRedCards !== undefined ? spRedCards : null) : null,
            spTotalCards: isEventEnabled(existingMatch.stage, "spTotalCards", settings) ? (spTotalCards || null) : null,
            spExtraTime: isEventEnabled(existingMatch.stage, "spExtraTime", settings) ? (spExtraTime !== undefined ? spExtraTime : null) : null,
            spInGamePenalty: isEventEnabled(existingMatch.stage, "spInGamePenalty", settings) ? (spInGamePenalty !== undefined ? spInGamePenalty : null) : null,
            spOwnGoal: isEventEnabled(existingMatch.stage, "spOwnGoal", settings) ? (spOwnGoal !== undefined ? spOwnGoal : null) : null,
            spFirstTeamToScore: isEventEnabled(existingMatch.stage, "spFirstTeamToScore", settings) ? ((spFirstTeamToScore && spFirstTeamToScore !== "" && spFirstTeamToScore !== "none") ? spFirstTeamToScore : null) : null,
        };

        // Filled by the name of the moderator who updates the score
        if (session.user && (session.user as any).role === "MODERATOR") {
            updateFields.scoreUpdatedBy = session.user.name || session.user.email || "Moderator";
        } else {
            // Null if set by Admin (as it's specifically for tracking moderators)
            updateFields.scoreUpdatedBy = null;
        }

        const updatedMatch = await Match.findByIdAndUpdate(id, updateFields, { new: true });

        const predictions = await Prediction.find({ match: id });

        // Update all predictions for this match with calculated points
        await Promise.all(predictions.map(async (prediction: any) => {
            const points = calculatePoints(
                prediction.homeScore,
                prediction.awayScore,
                homeScore,
                awayScore,
                settings,
                prediction.penaltyPrediction,
                wentToPenalties || false,
                updatedMatch.isKnockout,
                prediction.predictedWinner,
                updatedMatch.winner,
                updatedMatch.stage,
                {
                    spRedCards: prediction.spRedCards,
                    spTotalCards: prediction.spTotalCards,
                    spExtraTime: prediction.spExtraTime,
                    spInGamePenalty: prediction.spInGamePenalty,
                    spOwnGoal: prediction.spOwnGoal,
                    spFirstTeamToScore: prediction.spFirstTeamToScore,
                },
                {
                    spRedCards: updatedMatch.spRedCards,
                    spTotalCards: updatedMatch.spTotalCards,
                    spExtraTime: updatedMatch.spExtraTime,
                    spInGamePenalty: updatedMatch.spInGamePenalty,
                    spOwnGoal: updatedMatch.spOwnGoal,
                    spFirstTeamToScore: updatedMatch.spFirstTeamToScore,
                }
            );

            await Prediction.findByIdAndUpdate(prediction._id, { points });
        }));

        revalidatePath("/admin/matches");
        revalidatePath("/admin/set-score");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to update score:", error);
        return { message: "Failed to update score" };
    }
}

export async function getUnsetMatches() {
    const session = await auth();
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "MODERATOR")) {
        throw new Error("Unauthorized");
    }

    await connectToDatabase();
    const now = new Date();
    const matches = await Match.find({
        status: { $ne: "FINISHED" },
        kickOff: { $lt: now }
    })
    .populate("homeTeam", "name flagUrl")
    .populate("awayTeam", "name flagUrl")
    .populate("penaltyWinner", "name")
    .populate("winner", "_id")
    .sort({ kickOff: 1 });

    return JSON.parse(JSON.stringify(matches));
}
