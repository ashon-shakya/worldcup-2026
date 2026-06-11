import connectToDatabase from "./db";
import { Match, User } from "@/models/schema";
import { sendMatchesDigest } from "./mail";

export async function runSendMatchEmails() {
    await connectToDatabase();

    // Find matches approx 24 hours from now (±1 hour window)
    const now = new Date();
    const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const matches = await Match.find({
        kickOff: { $gte: from, $lte: to },
        status: "SCHEDULED",
    })
        .populate("homeTeam")
        .populate("awayTeam")
        .lean();

    if (!matches || matches.length === 0) {
        return { sent: 0, matchesFound: 0 };
    }

    const users = await User.find({}).lean();

    const sendPromises = users.map((u) => sendMatchesDigest(u.email, matches));
    await Promise.all(sendPromises);

    return { sent: users.length, matchesFound: matches.length };
}

export default runSendMatchEmails;
