"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import { SystemSettings } from "@/models/schema";
import { revalidatePath } from "next/cache";

export interface PointSettings {
    correctScore: number;
    correctOutcome: number; // Winner
    correctPenaltyPrediction: number; // For knockout rounds
}

const DEFAULT_SETTINGS: PointSettings = {
    correctScore: 5,
    correctOutcome: 3,
    correctPenaltyPrediction: 3,
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
