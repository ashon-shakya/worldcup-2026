"use server";

import { Match } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prediction } from "@/models/schema";
import { calculatePoints } from "@/lib/scoring";
import { getPointSettings } from "@/app/actions/admin/settings";

const MatchSchema = z.object({
    homeTeam: z.string().min(1, "Home team required"),
    awayTeam: z.string().min(1, "Away team required"),
    kickOff: z.coerce.date(),
    venue: z.string().optional(),
    stage: z.string().min(1, "Stage required"),
    isKnockout: z.coerce.boolean().optional(),
});

export async function createMatch(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = MatchSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid input", errors: parsed.error.flatten().fieldErrors };
    }

    const { homeTeam, awayTeam, kickOff, venue, stage, isKnockout } = parsed.data;

    try {
        await connectToDatabase();
        await Match.create({
            homeTeam,
            awayTeam,
            kickOff,
            venue,
            stage,
            isKnockout: isKnockout || false,
        });
        revalidatePath("/admin/matches");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to create match:", error);
        return { message: "Failed to create match" };
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
});

export async function updateMatchScore(id: string, prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = ScoreSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid score" };
    }

    const { homeScore, awayScore, wentToPenalties, penaltyWinner } = parsed.data;

    try {
        await connectToDatabase();
        // First get the match to check stage if isKnockout is missing
        const existingMatch = await Match.findById(id);
        const isKnockoutStage = ["Round of 32", "Round of 16", "Quarter Final", "Semi Final", "Final", "3rd Place"].includes(existingMatch?.stage);

        // Determine winner logic
        let winnerId = null;
        if (homeScore > awayScore) {
            winnerId = existingMatch.homeTeam;
        } else if (awayScore > homeScore) {
            winnerId = existingMatch.awayTeam;
        } else if (!!wentToPenalties && penaltyWinner) {
            winnerId = penaltyWinner;
        }

        const updatedMatch = await Match.findByIdAndUpdate(id, {
            homeScore,
            awayScore,
            status: "FINISHED",
            wentToPenalties: !!wentToPenalties,
            penaltyWinner: penaltyWinner || null,
            winner: winnerId,
            // Ensure isKnockout is set if it wasn't
            isKnockout: existingMatch?.isKnockout || isKnockoutStage
        }, { new: true });


        const predictions = await Prediction.find({ match: id });

        // Fetch point settings
        const settings = await getPointSettings();

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
                updatedMatch.isKnockout
            );

            await Prediction.findByIdAndUpdate(prediction._id, { points });
        }));

        revalidatePath("/admin/matches");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to update score:", error);
        return { message: "Failed to update score" };
    }
}
