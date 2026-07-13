"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import { SystemSettings } from "@/models/schema";
import { revalidatePath } from "next/cache";

export interface PointSettings {
    correctScore: number;
    correctOutcome: number; // Winner
    correctPenaltyPrediction: number; // For knockout rounds
    spStages?: string[];
    spStageEvents?: Record<string, string[]>;
    spRedCardsCorrect?: number;
    spRedCardsIncorrect?: number;
    spTotalCardsCorrect?: number;
    spTotalCardsIncorrect?: number;
    spExtraTimeCorrect?: number;
    spExtraTimeIncorrect?: number;
    spInGamePenaltyCorrect?: number;
    spInGamePenaltyIncorrect?: number;
    spOwnGoalCorrect?: number;
    spOwnGoalIncorrect?: number;
    spFirstTeamScoreCorrect?: number;
    spFirstTeamScoreIncorrect?: number;
}

const DEFAULT_SETTINGS: PointSettings = {
    correctScore: 5,
    correctOutcome: 3,
    correctPenaltyPrediction: 3,
    spStages: [
        "Group Stage",
        "Round of 32",
        "Round of 16",
        "Quarter Final",
        "Semi Final",
        "3rd Place",
        "Final"
    ],
    spStageEvents: {
        "Group Stage": ["spRedCards", "spTotalCards", "spExtraTime", "spInGamePenalty", "spOwnGoal", "spFirstTeamToScore"],
        "Round of 32": ["spRedCards", "spTotalCards", "spExtraTime", "spInGamePenalty", "spOwnGoal", "spFirstTeamToScore"],
        "Round of 16": ["spRedCards", "spTotalCards", "spExtraTime", "spInGamePenalty", "spOwnGoal", "spFirstTeamToScore"],
        "Quarter Final": ["spRedCards", "spTotalCards", "spExtraTime", "spInGamePenalty", "spOwnGoal", "spFirstTeamToScore"],
        "Semi Final": ["spRedCards", "spTotalCards", "spExtraTime", "spInGamePenalty", "spOwnGoal", "spFirstTeamToScore"],
        "3rd Place": ["spRedCards", "spTotalCards", "spExtraTime", "spInGamePenalty", "spOwnGoal", "spFirstTeamToScore"],
        "Final": ["spRedCards", "spTotalCards", "spExtraTime", "spInGamePenalty", "spOwnGoal", "spFirstTeamToScore"],
    },
    spRedCardsCorrect: 3,
    spRedCardsIncorrect: -2,
    spTotalCardsCorrect: 3,
    spTotalCardsIncorrect: -2,
    spExtraTimeCorrect: 3,
    spExtraTimeIncorrect: -2,
    spInGamePenaltyCorrect: 3,
    spInGamePenaltyIncorrect: -2,
    spOwnGoalCorrect: 3,
    spOwnGoalIncorrect: -2,
    spFirstTeamScoreCorrect: 3,
    spFirstTeamScoreIncorrect: -2,
};

export async function getPointSettings(): Promise<PointSettings> {
    await connectToDatabase();
    const settingsDoc = await SystemSettings.findOne({ key: "pointSettings" });

    if (!settingsDoc) {
        return DEFAULT_SETTINGS;
    }

    return { ...DEFAULT_SETTINGS, ...settingsDoc.value };
}

export async function updatePointSettings(settings: PointSettings) {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    try {
        await connectToDatabase();
        await SystemSettings.findOneAndUpdate(
            { key: "pointSettings" },
            { value: settings },
            { upsert: true, new: true }
        );
        revalidatePath("/admin/settings");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to update settings:", error);
        return { message: "Failed to update settings" };
    }
}
