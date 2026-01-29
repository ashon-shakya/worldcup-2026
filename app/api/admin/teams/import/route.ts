import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import { Team } from "@/models/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        // Basic validation of headers
        const requiredHeaders = ["name", "shortName", "flagUrl", "group"];
        const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

        if (missingHeaders.length > 0) {
            return NextResponse.json(
                { error: `Missing headers: ${missingHeaders.join(", ")}` },
                { status: 400 }
            );
        }

        await connectToDatabase();

        let importedCount = 0;
        let errors: string[] = [];

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(",").map((v) => v.trim());

            // Basic mapping based on index. Only works if CSV columns are in specific order OR we map by header index.
            // Let's map by header index for flexibility
            const teamData: any = {};

            headers.forEach((header, index) => {
                if (values[index]) {
                    teamData[header] = values[index];
                }
            });

            if (!teamData.name || !teamData.shortName) {
                errors.push(`Row ${i + 1}: Missing name or shortName`);
                continue;
            }

            try {
                // Upsert: Update if exists, Insert if not
                await Team.findOneAndUpdate(
                    { shortName: teamData.shortName },
                    teamData,
                    { upsert: true, new: true }
                );
                importedCount++;
            } catch (err: any) {
                errors.push(`Row ${i + 1}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            importedCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error("CSV Import Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
