import { auth } from "@/auth";
import { Match, Prediction, User } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

function getStageTheme(stage: string) {
    const s = stage?.toLowerCase() || "";
    if (s.includes("final") && !s.includes("quarter") && !s.includes("semi")) {
        // Final
        return {
            level: "final",
            glowClass: "fiery-level-final",
            badgeClass: "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white animate-pulse font-black border border-yellow-400/50",
            title: "The Grand Final"
        };
    } else if (s.includes("semi")) {
        // Semi Final
        return {
            level: "semi",
            glowClass: "fiery-level-semi",
            badgeClass: "bg-gradient-to-r from-red-600 to-orange-600 text-white font-black border border-orange-500/40",
            title: "Semi Final"
        };
    } else if (s.includes("quarter")) {
        // Quarter Final
        return {
            level: "quarter",
            glowClass: "fiery-level-quarter",
            badgeClass: "bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black border border-amber-500/30",
            title: "Quarter Final"
        };
    } else if (s.includes("16") || s.includes("32") || s.includes("knockout")) {
        // Round of 16 / 32
        return {
            level: "knockout",
            glowClass: "fiery-level-knockout",
            badgeClass: "bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-black border border-yellow-500/20",
            title: stage
        };
    } else {
        // Group Stage
        return {
            level: "group",
            glowClass: "fiery-level-group",
            badgeClass: "bg-slate-800 text-slate-300 font-bold border border-slate-700",
            title: "Group Stage"
        };
    }
}

async function getNextMatchesOfDay() {
    await connectToDatabase();
    const now = new Date();
    // 1. Find the first upcoming scheduled match
    const nextMatch = await Match.findOne({ kickOff: { $gt: now }, status: "SCHEDULED" })
        .sort({ kickOff: 1 })
        .populate("homeTeam")
        .populate("awayTeam");

    if (!nextMatch) return [];

    // 2. Find all matches scheduled on that same calendar day
    const kickOffDate = new Date(nextMatch.kickOff);
    const startOfDay = new Date(kickOffDate.getFullYear(), kickOffDate.getMonth(), kickOffDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(kickOffDate.getFullYear(), kickOffDate.getMonth(), kickOffDate.getDate(), 23, 59, 59, 999);

    const matches = await Match.find({
        kickOff: { $gte: startOfDay, $lte: endOfDay },
        status: "SCHEDULED"
    })
    .sort({ kickOff: 1 })
    .populate("homeTeam")
    .populate("awayTeam");

    return JSON.parse(JSON.stringify(matches));
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

    const nextMatches = await getNextMatchesOfDay();
    const stats = await getUserStats(user.id);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {(user as any).nickname || user.name}</h1>

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
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        {nextMatches.length > 1 ? "Featured Matchups Today" : "Featured Next Match"}
                    </h3>
                    <Link href="/dashboard/matches" className="text-sm text-indigo-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1">
                        View Schedule &rarr;
                    </Link>
                </div>

                {nextMatches.length > 0 ? (
                    <div className="divide-y divide-slate-800 bg-slate-950">
                        {nextMatches.map((match: any, index: number) => {
                            const stageTheme = getStageTheme(match.stage);
                            
                            return (
                                <div key={match._id} className="relative overflow-hidden px-4 py-12 sm:p-12 md:p-16 flex flex-col items-center">
                                    {/* Background light glow effects */}
                                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                    {/* Head-to-Head Visual Area */}
                                    <div className="relative z-10 w-full max-w-4xl flex flex-row items-center justify-between gap-2 sm:gap-6 md:gap-12">
                                        
                                        {/* Home Team Hero Card */}
                                        <div className="flex-1 flex flex-col items-center animate-slide-left opacity-0" style={{ animationDelay: `${index * 150 + 200}ms` }}>
                                            <div className={`fiery-border-wrapper ${stageTheme.glowClass} w-full max-w-[110px] sm:max-w-[200px] md:max-w-[260px] aspect-[3/4] relative`}>
                                                <div className="fiery-border-content relative w-full h-full overflow-hidden rounded-[calc(1.5rem-3px)]">
                                                    <img 
                                                        src={match.homeTeam?.championImageUrl || "/dummy-champion.png"} 
                                                        alt={match.homeTeam?.name} 
                                                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                                                    />
                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                                                    {/* Flag and short code overlay */}
                                                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 flex items-center gap-1.5 sm:gap-3">
                                                        {match.homeTeam?.flagUrl && (
                                                            <img src={match.homeTeam.flagUrl} alt="" className="w-5 h-3.5 sm:w-8 sm:h-6 object-cover rounded shadow-md border border-white/20" />
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-white text-[8px] sm:text-xs font-bold uppercase tracking-wider">{match.homeTeam?.shortName}</p>
                                                            <p className="text-white font-black text-[10px] sm:text-sm md:text-lg leading-tight line-clamp-1 truncate">{match.homeTeam?.name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* VS & Match Info Panel */}
                                        <div className="flex flex-col items-center justify-center flex-shrink-0 z-20 animate-drop-in opacity-0" style={{ animationDelay: `${index * 150 + 100}ms` }}>
                                            <div className={`${stageTheme.badgeClass} px-2 py-0.5 sm:px-6 sm:py-1.5 rounded-full text-[8px] sm:text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 mb-2 sm:mb-4 whitespace-nowrap`}>
                                                {stageTheme.title}
                                            </div>
                                            
                                            <div className="relative flex items-center justify-center h-10 w-10 sm:h-20 sm:w-20 md:h-24 md:w-24">
                                                {/* Rotating VS background */}
                                                <div className="absolute inset-0 border border-orange-500/20 rounded-full animate-spin [animation-duration:15s] pointer-events-none"></div>
                                                <div className="absolute inset-2 border border-red-500/10 rounded-full animate-spin [animation-duration:10s] reverse pointer-events-none"></div>
                                                
                                                <div className="text-lg sm:text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-orange-400 via-red-500 to-yellow-500 drop-shadow-[0_4px_12px_rgba(239,68,68,0.5)]">
                                                    VS
                                                </div>
                                            </div>

                                            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg sm:rounded-2xl px-2 py-1.5 sm:px-6 sm:py-4 mt-2 sm:mt-4 flex flex-col items-center gap-0.5 sm:gap-2 shadow-xl whitespace-nowrap">
                                                <div className="flex items-center text-slate-300 text-[8px] sm:text-xs md:text-sm font-semibold">
                                                    <Calendar className="w-2.5 h-2.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-orange-500" />
                                                    {new Date(match.kickOff).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="flex items-center text-slate-300 text-[8px] sm:text-xs md:text-sm font-semibold">
                                                    <Clock className="w-2.5 h-2.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-red-500" />
                                                    {new Date(match.kickOff).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <p className="text-[7px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 sm:mt-1 hidden xs:block">{match.venue}</p>
                                            </div>

                                            <div className="mt-4 sm:mt-8">
                                                <Link
                                                    href="/dashboard/matches"
                                                    className="relative inline-flex group items-center justify-center p-0.5 overflow-hidden text-[9px] sm:text-sm font-bold text-white rounded-full group bg-gradient-to-br from-orange-500 to-red-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-red-800 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300"
                                                >
                                                    <span className="relative px-3 py-1.5 sm:px-8 sm:py-3 transition-all ease-in duration-75 bg-slate-950 rounded-full group-hover:bg-opacity-0">
                                                        Predict
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Away Team Hero Card */}
                                        <div className="flex-1 flex flex-col items-center animate-slide-right opacity-0" style={{ animationDelay: `${index * 150 + 300}ms` }}>
                                            <div className={`fiery-border-wrapper ${stageTheme.glowClass} w-full max-w-[110px] sm:max-w-[200px] md:max-w-[260px] aspect-[3/4] relative`}>
                                                <div className="fiery-border-content relative w-full h-full overflow-hidden rounded-[calc(1.5rem-3px)]">
                                                    <img 
                                                        src={match.awayTeam?.championImageUrl || "/dummy-champion.png"} 
                                                        alt={match.awayTeam?.name} 
                                                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                                                    />
                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                                                    {/* Flag and short code overlay */}
                                                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 flex items-center gap-1.5 sm:gap-3">
                                                        {match.awayTeam?.flagUrl && (
                                                            <img src={match.awayTeam.flagUrl} alt="" className="w-5 h-3.5 sm:w-8 sm:h-6 object-cover rounded shadow-md border border-white/20" />
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-white text-[8px] sm:text-xs font-bold uppercase tracking-wider">{match.awayTeam?.shortName}</p>
                                                            <p className="text-white font-black text-[10px] sm:text-sm md:text-lg leading-tight line-clamp-1 truncate">{match.awayTeam?.name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500 dark:text-slate-400 bg-gray-50/30 dark:bg-slate-900/30">
                        No upcoming matches scheduled.
                    </div>
                )}
            </div>
        </div>
    );
}
