import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { User } from "@/models/schema";
import connectToDatabase from "@/lib/db";

export const generateVerificationToken = async (email: string) => {
    await connectToDatabase();
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    const user = await User.findOne({ email });
    if (user) {
        user.verificationToken = token;
        user.verificationTokenExpires = expires;
        await user.save();
    }

    return token;
};
