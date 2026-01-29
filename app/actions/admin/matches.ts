"use server";

import { Match } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prediction } from "@/models/schema";
import { calculatePoints } from "@/lib/scoring";

const MatchSchema = z.object({
    homeTeam: z.string().min(1, "Home team required"),
    awayTeam: z.string().min(1, "Away team required"),
    kickOff: z.coerce.date(),
    venue: z.string().optional(),
    stage: z.string().min(1, "Stage required"),
});

export async function createMatch(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = MatchSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid input", errors: parsed.error.flatten().fieldErrors };
    }

    const { homeTeam, awayTeam, kickOff, venue, stage } = parsed.data;

    try {
        await connectToDatabase();
        await Match.create({
            homeTeam,
            awayTeam,
            kickOff,
            venue,
            stage
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
        .sort({ kickOff: 1 });
    return JSON.parse(JSON.stringify(matches));
}

const ScoreSchema = z.object({
    homeScore: z.coerce.number().min(0),
    awayScore: z.coerce.number().min(0),
});

export async function updateMatchScore(id: string, prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = ScoreSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid score" };
    }

    const { homeScore, awayScore } = parsed.data;

    try {
        await connectToDatabase();
        await Match.findByIdAndUpdate(id, {
            homeScore,
            awayScore,
            status: "FINISHED"
        });

        // specific points calculation
        const predictions = await Prediction.find({ match: id });

        // Update all predictions for this match with calculated points
        await Promise.all(predictions.map(async (prediction: any) => {
            const points = calculatePoints(
                prediction.homeScore,
                prediction.awayScore,
                homeScore,
                awayScore
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
