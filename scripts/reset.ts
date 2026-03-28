import dotenv from "dotenv";
import mongoose from "mongoose";
import { User, Team, Match, Group, Prediction, SystemSettings } from "../models/schema";
import path from "path";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env");
    process.exit(1);
}

async function reset() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to MongoDB");

        console.log("Deleting all data...");
        await Promise.all([
            User.deleteMany({}),
            Team.deleteMany({}),
            Match.deleteMany({}),
            Group.deleteMany({}),
            Prediction.deleteMany({}),
            SystemSettings.deleteMany({})
        ]);

        console.log("All data deleted successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error resetting database:", error);
        process.exit(1);
    }
}

reset();
