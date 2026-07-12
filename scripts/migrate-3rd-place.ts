import dotenv from "dotenv";
import mongoose from "mongoose";
import { Group } from "../models/schema";
import path from "path";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env");
    process.exit(1);
}

async function migrate() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to MongoDB successfully.");

        // Find all groups
        const groups = await Group.find({});
        console.log(`Found ${groups.length} groups to scan.`);

        let updatedCount = 0;

        for (const group of groups) {
            let modified = false;

            // Initialize/update includedStages
            if (!group.includedStages) {
                group.includedStages = ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "3rd Place", "Final"];
                modified = true;
            } else if (!group.includedStages.includes("3rd Place")) {
                // Insert 3rd Place before Final if Final exists, otherwise append
                const finalIndex = group.includedStages.indexOf("Final");
                if (finalIndex !== -1) {
                    group.includedStages.splice(finalIndex, 0, "3rd Place");
                } else {
                    group.includedStages.push("3rd Place");
                }
                // Mark modified because Mongoose mixed array update might not auto-detect splice
                group.markModified("includedStages");
                modified = true;
            }

            // Initialize/update stageMultipliers
            if (!group.stageMultipliers) {
                group.stageMultipliers = {
                    "Group Stage": 1,
                    "Round of 32": 1,
                    "Round of 16": 1,
                    "Quarter Final": 1,
                    "Semi Final": 1,
                    "3rd Place": 1,
                    "Final": 1
                };
                modified = true;
            } else if (group.stageMultipliers["3rd Place"] === undefined) {
                group.stageMultipliers["3rd Place"] = 1;
                group.markModified("stageMultipliers");
                modified = true;
            }

            if (modified) {
                await group.save();
                console.log(`Updated group: ${group.name} (${group.code})`);
                updatedCount++;
            }
        }

        console.log(`Migration completed. Updated ${updatedCount} groups.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
