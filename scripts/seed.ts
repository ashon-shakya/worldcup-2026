import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Team, Match, Group } from "../models/schema"; // Adjust import based on your structure, might need full path if running with ts-node
import path from "path";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env");
    process.exit(1);
}

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to MongoDB");

        const hashedPassword = await bcrypt.hash("password123", 10);

        // Seed Admin
        const admin = await User.findOneAndUpdate(
            { email: "admin@example.com" },
            {
                name: "Super Admin",
                email: "admin@example.com",
                password: hashedPassword,
                role: "ADMIN",
                emailVerified: new Date(),
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
            },
            { upsert: true, new: true }
        );
        console.log("Seeded Admin:", admin.email);

        // Seed User
        const user = await User.findOneAndUpdate(
            { email: "user@example.com" },
            {
                name: "John Doe",
                email: "user@example.com",
                password: hashedPassword,
                role: "USER",
                emailVerified: new Date(),
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
            },
            { upsert: true, new: true }
        );
        console.log("Seeded User:", user.email);

        // Seed Teams
        const team1 = await Team.findOneAndUpdate({ shortName: "BR" }, { name: "Brazil", shortName: "BR", group: "A", flagUrl: "https://flagcdn.com/br.svg" }, { upsert: true, new: true });
        const team2 = await Team.findOneAndUpdate({ shortName: "FR" }, { name: "France", shortName: "FR", group: "A", flagUrl: "https://flagcdn.com/fr.svg" }, { upsert: true, new: true });
        const team3 = await Team.findOneAndUpdate({ shortName: "AR" }, { name: "Argentina", shortName: "AR", group: "B", flagUrl: "https://flagcdn.com/ar.svg" }, { upsert: true, new: true });
        const team4 = await Team.findOneAndUpdate({ shortName: "DE" }, { name: "Germany", shortName: "DE", group: "B", flagUrl: "https://flagcdn.com/de.svg" }, { upsert: true, new: true });
        console.log("Seeded 4 Teams");

        // Seed Group
        const myGroup = await Group.findOneAndUpdate(
            { code: "DEMO1" },
            { name: "Demo League", code: "DEMO1", owner: admin._id, isPrivate: false, members: [admin._id, user._id] },
            { upsert: true, new: true }
        );
        console.log("Seeded Group:", myGroup.name);

        // Seed Matches
        const nextDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000);

        await Match.findOneAndUpdate(
            { homeTeam: team1._id, awayTeam: team2._id },
            { homeTeam: team1._id, awayTeam: team2._id, kickOff: nextDay, stage: "Group Stage", status: "SCHEDULED" },
            { upsert: true, new: true }
        );

        await Match.findOneAndUpdate(
            { homeTeam: team3._id, awayTeam: team4._id },
            { homeTeam: team3._id, awayTeam: team4._id, kickOff: dayAfter, stage: "Group Stage", status: "SCHEDULED" },
            { upsert: true, new: true }
        );
        console.log("Seeded 2 Matches");

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {

        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seed();
