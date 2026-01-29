import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import { Match, Team } from "@/models/schema";
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

        // Validate headers
        const requiredHeaders = ["homeTeam", "awayTeam", "kickOff", "venue", "stage"];
        const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

        if (missingHeaders.length > 0) {
            return NextResponse.json(
                { error: `Missing headers: ${missingHeaders.join(", ")}` },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Fetch all teams for quick lookup
        const teams = await Team.find({});
        const teamMap = new Map(teams.map((t: any) => [t.shortName, t]));

        let importedCount = 0;
        let errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(",").map((v) => v.trim());
            const matchData: any = {};

            headers.forEach((header, index) => {
                if (values[index]) {
                    matchData[header] = values[index];
                }
            });

            if (!matchData.homeTeam || !matchData.awayTeam || !matchData.kickOff) {
                errors.push(`Row ${i + 1}: Missing required fields`);
                continue;
            }

            const homeTeamDetails = teamMap.get(matchData.homeTeam);
            const awayTeamDetails = teamMap.get(matchData.awayTeam);

            if (!homeTeamDetails) {
                errors.push(`Row ${i + 1}: Home team '${matchData.homeTeam}' not found`);
                continue;
            }
            if (!awayTeamDetails) {
                errors.push(`Row ${i + 1}: Away team '${matchData.awayTeam}' not found`);
                continue;
            }

            // Only validate group for Group Stage
            if (matchData.stage === "Group Stage") {
                if (homeTeamDetails.group !== awayTeamDetails.group) {
                    errors.push(`Row ${i + 1}: Teams ${matchData.homeTeam} (${homeTeamDetails.group}) and ${matchData.awayTeam} (${awayTeamDetails.group}) are not in the same group`);
                    continue;
                }
            }

            try {
                // Check if match already exists (same teams and kickOff)
                const existingMatch = await Match.findOne({
                    homeTeam: homeTeamDetails._id,
                    awayTeam: awayTeamDetails._id,
                    kickOff: new Date(matchData.kickOff)
                });

                if (existingMatch) {
                    // Update existing? Or skip? Let's update.
                    existingMatch.venue = matchData.venue;
                    existingMatch.stage = matchData.stage;
                    await existingMatch.save();
                } else {
                    await Match.create({
                        homeTeam: homeTeamDetails._id,
                        awayTeam: awayTeamDetails._id,
                        kickOff: new Date(matchData.kickOff),
                        venue: matchData.venue,
                        stage: matchData.stage,
                        status: "SCHEDULED"
                    });
                }
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
        console.error("Match Import Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
