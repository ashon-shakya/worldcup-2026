"use client";

import { useEffect, useState } from "react";
import { getUnsetMatches } from "@/app/actions/admin/matches";
import ScoreModal from "@/components/admin/ScoreModal";
import { Calendar, MapPin, Trophy, Clock, CheckCircle2 } from "lucide-react";

export default function SetScorePage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [scoreModalMatch, setScoreModalMatch] = useState<any>(null);

    const fetchUnsetMatches = async () => {
        setIsLoading(true);
        try {
            const data = await getUnsetMatches();
            setMatches(data);
        } catch (error) {
            console.error("Failed to fetch unset matches:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUnsetMatches();
    }, [scoreModalMatch]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Set Match Scores</h1>
                <p className="mt-1.5 text-sm text-gray-500">
                    Moderator Panel — enter final scores for matches that have already kicked off or finished.
                </p>
            </div>

            {/* Main Matches Card Grid */}
            {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Clock className="h-6 w-6 text-gray-400 animate-spin" />
                        <span className="text-sm font-medium">Loading matches...</span>
                    </div>
                </div>
            ) : matches.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                        <h3 className="text-lg font-bold text-gray-800">All Caught Up!</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            No matches are currently awaiting score entries. All completed match scores have been set.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((match: any) => (
                        <div key={match._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                            {/* Card Header */}
                            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                                    match.stage === "Group Stage" ? "bg-gray-50 text-gray-600 ring-gray-500/10" :
                                    match.stage === "Round of 32" ? "bg-blue-50 text-green-700 ring-green-700/10" :
                                    match.stage === "Round of 16" ? "bg-blue-50 text-blue-700 ring-blue-700/10" :
                                    match.stage === "Quarter Final" ? "bg-amber-50 text-amber-700 ring-amber-700/10" :
                                    match.stage === "Semi Final" ? "bg-purple-50 text-purple-700 ring-purple-700/10" :
                                    match.stage === "3rd Place" ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20" :
                                    match.stage === "Final" ? "bg-rose-50 text-rose-700 ring-rose-700/10" :
                                    "bg-indigo-50 text-indigo-700 ring-indigo-700/10"
                                }`}>
                                    {match.stage}
                                </span>
                                {match.venue && (
                                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-gray-400" />
                                        {match.venue}
                                    </span>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col justify-center">
                                <div className="flex items-center justify-between gap-4">
                                    {/* Home Team */}
                                    <div className="flex flex-col items-center flex-1 text-center">
                                        {match.homeTeam?.flagUrl ? (
                                            <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="w-12 h-8 object-cover rounded shadow-sm border border-gray-100 mb-2" />
                                        ) : (
                                            <div className="w-12 h-8 bg-gray-100 rounded border border-gray-200 mb-2 flex items-center justify-center text-xs font-bold text-gray-400">?</div>
                                        )}
                                        <span className="font-bold text-gray-900 text-sm line-clamp-1">{match.homeTeam?.name || "Unknown"}</span>
                                    </div>

                                    {/* VS Divider */}
                                    <div className="flex flex-col items-center">
                                        <span className="bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1 text-[10px] font-black text-gray-400 uppercase tracking-wider shadow-sm">
                                            VS
                                        </span>
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex flex-col items-center flex-1 text-center">
                                        {match.awayTeam?.flagUrl ? (
                                            <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="w-12 h-8 object-cover rounded shadow-sm border border-gray-100 mb-2" />
                                        ) : (
                                            <div className="w-12 h-8 bg-gray-100 rounded border border-gray-200 mb-2 flex items-center justify-center text-xs font-bold text-gray-400">?</div>
                                        )}
                                        <span className="font-bold text-gray-900 text-sm line-clamp-1">{match.awayTeam?.name || "Unknown"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/20 space-y-3">
                                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {formatDate(match.kickOff)}
                                </div>
                                <button
                                    onClick={() => setScoreModalMatch(match)}
                                    className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-600"
                                >
                                    <Trophy className="h-3.5 w-3.5 mr-1.5" />
                                    Set Score
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Score Entry Modal */}
            {scoreModalMatch && (
                <ScoreModal
                    match={scoreModalMatch}
                    onClose={() => setScoreModalMatch(null)}
                />
            )}
        </div>
    );
}
