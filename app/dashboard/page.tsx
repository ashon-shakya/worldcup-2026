import { auth } from "@/auth";
import { Match, Prediction, User } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

async function getNextMatch() {
    await connectToDatabase();
    // Find the first match that is scheduled in the future
    const now = new Date();
    const matches = await Match.find({ kickOff: { $gt: now }, status: "SCHEDULED" })
        .sort({ kickOff: 1 })
        .limit(1)
        .populate("homeTeam")
        .populate("awayTeam");

    return matches[0] ? JSON.parse(JSON.stringify(matches[0])) : null;
}

// Placeholder for user stats
async function getUserStats(userId: string) {
    await connectToDatabase();
    // Calculate total points from all predictions
    // This aggregates points from the Prediction collection for this user
    const predictions = await Prediction.find({ user: userId });
    const totalPoints = predictions.reduce((acc: number, curr: any) => acc + (curr.points || 0), 0);

    // Rank calculation would be more complex (count users with higher points + 1)
    // For now, placeholder rank
    return { totalPoints, rank: "-" };
}

export default async function DashboardPage() {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) return null;

    const nextMatch = await getNextMatch();
    const stats = await getUserStats(user.id);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Points Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-indigo-100 font-medium">Total Points</p>
                    <h2 className="text-4xl font-bold mt-2">{stats.totalPoints}</h2>
                    <p className="text-sm text-indigo-200 mt-4">Rank: {stats.rank}</p>
                </div>

                {/* Status Card (optional) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-medium">Tournament Status</p>
                    <div className="mt-4 flex items-center text-green-600 font-bold">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Live / Upcoming
                    </div>
                </div>
            </div>

            {/* Next Match Highlight */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Next Match</h3>
                    <Link href="/dashboard/matches" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                        View Schedule &rarr;
                    </Link>
                </div>

                {nextMatch ? (
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            {/* Home Team */}
                            <div className="flex flex-col items-center flex-1">
                                {nextMatch.homeTeam?.flagUrl && (
                                    <img src={nextMatch.homeTeam.flagUrl} alt={nextMatch.homeTeam.name} className="w-16 h-12 object-cover rounded shadow-sm mb-3" />
                                )}
                                <span className="text-xl font-bold text-gray-900">{nextMatch.homeTeam?.name}</span>
                            </div>

                            {/* Match Info */}
                            <div className="flex flex-col items-center justify-center flex-shrink-0">
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
                                    {nextMatch.stage}
                                </span>
                                <div className="text-3xl font-black text-gray-300">VS</div>
                                <div className="flex items-center text-gray-500 mt-3 font-medium">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date(nextMatch.kickOff).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="flex items-center text-gray-500 mt-1 font-medium">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {new Date(nextMatch.kickOff).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            {/* Away Team */}
                            <div className="flex flex-col items-center flex-1">
                                {nextMatch.awayTeam?.flagUrl && (
                                    <img src={nextMatch.awayTeam.flagUrl} alt={nextMatch.awayTeam.name} className="w-16 h-12 object-cover rounded shadow-sm mb-3" />
                                )}
                                <span className="text-xl font-bold text-gray-900">{nextMatch.awayTeam?.name}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <Link
                                href="/dashboard/matches" // Or specific match prediction page
                                className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-transform transform hover:scale-105"
                            >
                                Make Prediction
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        No upcoming matches scheduled.
                    </div>
                )}
            </div>
        </div>
    );
}
