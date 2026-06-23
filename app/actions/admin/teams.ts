"use server";

import { Team } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TeamSchema = z.object({
    name: z.string().min(1, "Name is required"),
    shortName: z.string().length(2, "Use 2-letter Country Code (e.g. US, BR)").optional(),
    flagUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    championImageUrl: z.string().optional().or(z.literal("")),
    group: z.string().max(1, "Group must be a single letter").optional().or(z.literal("")),
});

async function uploadChampionImage(file: File, teamName: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Slugify team name for public_id
    const sanitizedName = teamName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

    const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: "worldcup-2026/champions",
                    public_id: sanitizedName,
                    overwrite: true,
                    transformation: [{ width: 600, height: 800, crop: "fill", gravity: "face" }],
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            )
            .end(buffer);
    });

    return uploadResult.secure_url;
}

export async function createTeam(prevState: any, formData: FormData) {
    const championImageFile = formData.get("championImageFile") as File;
    const name = formData.get("name") as string;

    let championImageUrl = formData.get("championImageUrl") as string;

    if (championImageFile && championImageFile.size > 0) {
        try {
            championImageUrl = await uploadChampionImage(championImageFile, name || "team");
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            return { message: "Cloudinary image upload failed" };
        }
    }

    const data = Object.fromEntries(formData);
    delete data.championImageFile;
    data.championImageUrl = championImageUrl;

    const parsed = TeamSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid input", errors: parsed.error.flatten().fieldErrors };
    }

    let { shortName, flagUrl, group } = parsed.data;

    // Auto-generate flag URL if shortName is provided and flagUrl is empty
    if (shortName && !flagUrl) {
        flagUrl = `https://flagsapi.com/${shortName.toUpperCase()}/flat/64.png`;
    }

    try {
        await connectToDatabase();
        await Team.create({ name, shortName, flagUrl, championImageUrl, group });
        revalidatePath("/admin/teams");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to create team:", error);
        return { message: "Failed to create team" };
    }
}

export async function updateTeam(id: string, prevState: any, formData: FormData) {
    const championImageFile = formData.get("championImageFile") as File;
    const name = formData.get("name") as string;

    let championImageUrl = formData.get("championImageUrl") as string;

    if (championImageFile && championImageFile.size > 0) {
        try {
            championImageUrl = await uploadChampionImage(championImageFile, name || "team");
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            return { message: "Cloudinary image upload failed" };
        }
    }

    const data = Object.fromEntries(formData);
    delete data.championImageFile;
    data.championImageUrl = championImageUrl;

    const parsed = TeamSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Invalid input", errors: parsed.error.flatten().fieldErrors };
    }

    let { shortName, flagUrl, group } = parsed.data;

    // Auto-generate flag URL if shortName is provided and flagUrl is empty
    if (shortName && !flagUrl) {
        flagUrl = `https://flagsapi.com/${shortName.toUpperCase()}/flat/64.png`;
    }

    try {
        await connectToDatabase();
        await Team.findByIdAndUpdate(id, { name, shortName, flagUrl, championImageUrl, group });
        revalidatePath("/admin/teams");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to update team:", error);
        return { message: "Failed to update team" };
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

export async function deleteTeams(ids: string[]) {
    try {
        await connectToDatabase();
        await Team.deleteMany({ _id: { $in: ids } });
        revalidatePath("/admin/teams");
        return { message: "success", deletedCount: ids.length };
    } catch (error) {
        console.error("Failed to delete teams:", error);
        return { message: "Failed to delete teams" };
    }
}

export async function getTeams() {
    await connectToDatabase();
    const teams = await Team.find({}).sort({ name: 1 });
    // Convert to plain objects to avoid serialization issues with Client Components if passed directly
    return JSON.parse(JSON.stringify(teams));
}
