import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/schema"; // Adjust import based on your structure, might need full path if running with ts-node
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

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seed();
