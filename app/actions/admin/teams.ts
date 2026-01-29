"use server";

import { Team } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TeamSchema = z.object({
    name: z.string().min(1, "Name is required"),
    shortName: z.string().length(2, "Use 2-letter Country Code (e.g. US, BR)").optional(),
    flagUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    group: z.string().max(1, "Group must be a single letter").optional().or(z.literal("")),
});

export async function createTeam(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = TeamSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid input", errors: parsed.error.flatten().fieldErrors };
    }

    let { name, shortName, flagUrl, group } = parsed.data;

    // Auto-generate flag URL if shortName is provided and flagUrl is empty
    if (shortName && !flagUrl) {
        flagUrl = `https://flagsapi.com/${shortName.toUpperCase()}/flat/64.png`;
    }

    try {
        await connectToDatabase();
        await Team.create({ name, shortName, flagUrl, group });
        revalidatePath("/admin/teams");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to create team:", error);
        return { message: "Failed to create team" };
    }
}

export async function deleteTeam(id: string) {
    try {
        await connectToDatabase();
        await Team.findByIdAndDelete(id);
        revalidatePath("/admin/teams");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to delete team:", error);
        return { message: "Failed to delete team" };
    }
}

export async function getTeams() {
    await connectToDatabase();
    const teams = await Team.find({}).sort({ name: 1 });
    // Convert to plain objects to avoid serialization issues with Client Components if passed directly
    return JSON.parse(JSON.stringify(teams));
}
