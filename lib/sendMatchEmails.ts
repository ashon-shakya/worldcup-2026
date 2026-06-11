import connectToDatabase from "./db";
import { Match, User } from "@/models/schema";
import { sendMatchesDigest } from "./mail";

export async function runSendMatchEmails(options?: { isManual?: boolean }) {
    await connectToDatabase();

    const now = new Date();
    let from: Date;
    let to: Date;

    if (options?.isManual) {
        // Manual trigger: find matches starting from 2 hours ago up to 30 hours from now
        from = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        to = new Date(now.getTime() + 30 * 60 * 60 * 1000);
    } else {
        // Cron trigger: find matches approx 24 hours from now (±1 hour window)
        from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
        to = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    }

    console.log("Searching for matches with kickoff in range:", {
        from: from.toISOString(),
        to: to.toISOString(),
        isManual: !!options?.isManual
    });

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
