import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { User, Team, Match, Prediction, Group, SystemSettings } from "../models/schema";

// Load environment variables from local development env files
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env or .env.local");
    process.exit(1);
}

async function migrate() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected successfully.");

        const models = [
            { name: "User", model: User },
            { name: "Team", model: Team },
            { name: "Match", model: Match },
            { name: "Prediction", model: Prediction },
            { name: "Group", model: Group },
            { name: "SystemSettings", model: SystemSettings }
        ];

        for (const { name, model } of models) {
            console.log(`Syncing indexes for ${name}...`);
            try {
                // syncIndexes will build new indexes and drop obsolete ones
                const synced = await model.syncIndexes();
                console.log(`Successfully synced indexes for ${name}:`, synced);
            } catch (err: any) {
                console.error(`Error syncing indexes for ${name}:`, err.message || err);
            }
        }

        console.log("Database index synchronization finished.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

migrate();
