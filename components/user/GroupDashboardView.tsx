"use client";

import { useState, useEffect } from "react";
import { Trophy, ChevronLeft, ChevronRight, Calendar, Clock, HelpCircle, FileText, ListOrdered, ChevronDown } from "lucide-react";
import { getGroupFinishedMatchesPredictions } from "@/app/actions/groups";
import Link from "next/link";
import GroupMemberRow from "./GroupMemberRow";
import LeaderboardRace from "./LeaderboardRace";
import LocalTime from "@/components/ui/LocalTime";

interface GroupDashboardViewProps {
    groupId: string;
    leaderboard: any[];
    group: any;
    currentUserId?: string;
}

export default function GroupDashboardView({ groupId, leaderboard, group, currentUserId }: GroupDashboardViewProps) {
    const [activeTab, setActiveTab] = useState<"leaderboard" | "race" | "predictions">("leaderboard");
    const [matches, setMatches] = useState<any[]>([]);
    const [predictionsMap, setPredictionsMap] = useState<Record<string, Record<string, any>>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMatches, setTotalMatches] = useState(0);
    const [loading, setLoading] = useState(false);
    const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === "predictions") {
            const fetchPredictions = async () => {
                setLoading(true);
                try {
                    const data = await getGroupFinishedMatchesPredictions(groupId, currentPage);
                    setMatches(data.matches);
                    setPredictionsMap(data.predictionsMap);
                    setTotalPages(data.totalPages);
                    setTotalMatches(data.totalMatches);
                    // Reset expanded match when page changes
                    setExpandedMatchId(null);
                } catch (error) {
                    console.error("Error fetching group predictions:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPredictions();
        }
    }, [activeTab, groupId, currentPage]);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-xl p-1 shadow-xs border gap-1">
                <button
                    onClick={() => setActiveTab("leaderboard")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${activeTab === "leaderboard" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}
                >
                    <ListOrdered size={16} />
                    <span className="hidden sm:inline">Leaderboard</span>
                </button>
                <button
                    onClick={() => setActiveTab("race")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${activeTab === "race" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}
                >
                    <Trophy size={16} />
                    <span className="hidden sm:inline">Leaderboard Race</span>
                </button>
                <button
                    onClick={() => {
                        setActiveTab("predictions");
                        setCurrentPage(1);
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${activeTab === "predictions" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}
                >
                    <FileText size={16} />
                    <span className="hidden sm:inline">Match Predictions</span>
                </button>
            </div>

            {/* Leaderboard Tab Content */}
            {activeTab === "leaderboard" && (
                <div className="bg-white dark:bg-slate-900/60 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Leaderboard</h2>
                    </div>

                    {leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-gray-550 dark:text-gray-400">No members yet.</div>
                    ) : (
                        <div>
                            {leaderboard.map((user: any, index: number) => (
                                <GroupMemberRow
                                    key={user._id}
                                    user={user}
                                    index={index}
                                    currentUserId={currentUserId}
                                    allowedStages={group.includedStages || []}
                                    stageMultipliers={group.stageMultipliers || {}}
                                    groupId={groupId}
                                    isPrivate={group.isPrivate}
                                    isAdmin={currentUserId?.toString() === group.owner?.toString()}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Leaderboard Race Tab Content */}
            {activeTab === "race" && (
                <LeaderboardRace groupId={groupId} />
            )}

            {/* Predictions Tab Content */}
            {activeTab === "predictions" && (
                <div className="bg-white dark:bg-slate-900/60 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white">Started Matches & Member Predictions</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Click on a match to view predictions of all members</p>
                        </div>
                        <span className="inline-block text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-center">
                            {totalMatches} Started Match{totalMatches !== 1 ? "es" : ""}
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-550 dark:text-gray-400 flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium">Loading predictions...</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
                            <HelpCircle className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                            <p className="font-semibold text-base text-gray-800 dark:text-gray-200">No started matches found</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">Once matches in the configured rounds have started, their predictions leaderboard grid will display here.</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {/* Accordion List */}
                            <div className="space-y-3">
                                {matches.map((match: any) => {
                                    const isKnockoutStage = ["Round of 32", "Round of 16", "Quarter Final", "Semi Final", "Final", "3rd Place"].includes(match.stage);
                                    const isKnockout = match.isKnockout || isKnockoutStage;
                                    const isExpanded = expandedMatchId === match._id;

                                    return (
                                        <div
                                            key={match._id}
                                            className="border border-gray-250 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-2xs hover:shadow-xs transition-all duration-200"
                                        >
                                            {/* Accordion Header */}
                                            <div
                                                onClick={() => setExpandedMatchId(isExpanded ? null : match._id)}
                                                className="flex items-center justify-between p-4 cursor-pointer select-none bg-gray-50/40 dark:bg-slate-950/20 hover:bg-gray-50/80 dark:hover:bg-slate-950/40 transition-colors gap-4"
                                            >
                                                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                                    {/* Stage & Date */}
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                                        <span className="uppercase">{match.stage}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-0.5">
                                                            <Calendar size={10} />
                                                            <LocalTime date={match.kickOff} showTime={false} formatOptions={{ month: "short", day: "numeric" }} />
                                                        </span>
                                                    </div>

                                                    {/* Matchup Teams */}
                                                    <div className="flex items-center gap-3 text-sm font-semibold flex-wrap">
                                                        <div className="flex items-center gap-1.5">
                                                            {match.homeTeam?.flagUrl && (
                                                                <img
                                                                    src={match.homeTeam.flagUrl}
                                                                    alt=""
                                                                    className="w-5 h-3.5 object-cover rounded shadow-3xs border border-gray-200/50 dark:border-slate-800 shrink-0"
                                                                />
                                                            )}
                                                            <span className="text-gray-800 dark:text-gray-200 font-bold truncate max-w-[120px] sm:max-w-none">
                                                                {match.homeTeam?.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-400 dark:text-gray-600 font-bold">vs</span>
                                                        <div className="flex items-center gap-1.5">
                                                            {match.awayTeam?.flagUrl && (
                                                                <img
                                                                    src={match.awayTeam.flagUrl}
                                                                    alt=""
                                                                    className="w-5 h-3.5 object-cover rounded shadow-3xs border border-gray-200/50 dark:border-slate-800 shrink-0"
                                                                />
                                                            )}
                                                            <span className="text-gray-800 dark:text-gray-200 font-bold truncate max-w-[120px] sm:max-w-none">
                                                                {match.awayTeam?.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Score / Chevron */}
                                                <div className="flex items-center gap-4 shrink-0">
                                                    {match.status === "FINISHED" ? (
                                                        <div className="flex items-center bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 px-3 py-1.5 rounded-lg text-sm font-black text-indigo-700 dark:text-indigo-400 shadow-3xs">
                                                            {match.homeScore} - {match.awayScore}
                                                            {isKnockout && match.wentToPenalties && (
                                                                <span className="text-[9px] text-purple-650 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-955/40 border border-purple-100 dark:border-purple-900/30 px-1.5 py-0.5 rounded ml-2 uppercase shrink-0">
                                                                    PK
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : match.status === "LIVE" ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-black bg-red-650 text-white px-2 py-1 rounded-md animate-pulse uppercase tracking-wider">
                                                                <span className="h-1.5 w-1.5 bg-white rounded-full"></span>
                                                                Live
                                                            </span>
                                                            <div className="flex items-center bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 px-3 py-1.5 rounded-lg text-sm font-black text-red-650 dark:text-red-400 shadow-3xs">
                                                                {match.homeScore ?? 0} - {match.awayScore ?? 0}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 px-3 py-1.5 rounded-lg text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider shadow-3xs">
                                                            Started
                                                        </div>
                                                    )}
                                                    <ChevronDown
                                                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180 text-indigo-600" : ""}`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Accordion Body: Vertical Predictions Table */}
                                            {isExpanded && (
                                                <div className="p-4 border-t border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/20 overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                                        <thead className="bg-gray-50/60 dark:bg-slate-950/30">
                                                            <tr>
                                                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Player
                                                                </th>
                                                                <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Prediction
                                                                </th>
                                                                <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Points Received
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white dark:bg-slate-900/40 divide-y divide-gray-150 dark:divide-slate-850">
                                                            {group.members.map((member: any) => {
                                                                const pred = predictionsMap[match._id]?.[member._id];
                                                                const winnerName = (() => {
                                                                    if (!pred || !pred.predictedWinner) return "";
                                                                    const winnerIdStr = pred.predictedWinner.toString();
                                                                    if (winnerIdStr === match.homeTeam?._id?.toString()) return match.homeTeam?.name || "";
                                                                    if (winnerIdStr === match.awayTeam?._id?.toString()) return match.awayTeam?.name || "";
                                                                    return "";
                                                                })();

                                                                // Points styling
                                                                let pointsStyle = "bg-gray-50 dark:bg-slate-900/50 text-gray-400 dark:text-gray-550 border border-gray-150 dark:border-gray-800";
                                                                if (pred && pred.points >= 13) {
                                                                    pointsStyle = "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 font-bold";
                                                                } else if (pred && pred.points > 0) {
                                                                    pointsStyle = "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 font-bold";
                                                                }

                                                                return (
                                                                    <tr key={member._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/20 transition-colors">
                                                                        <td className="px-4 py-3 text-left">
                                                                            <div className="flex items-center gap-2.5">
                                                                                <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-900/50 overflow-hidden shrink-0">
                                                                                    {member.image ? (
                                                                                        <img src={member.image} alt={member.nickname || member.name} className="h-full w-full object-cover" />
                                                                                    ) : (
                                                                                        (member.nickname || member.name).charAt(0).toUpperCase()
                                                                                    )}
                                                                                </div>
                                                                                <Link
                                                                                    href={`/dashboard/stats?userId=${member._id}`}
                                                                                    className="text-xs font-bold text-gray-900 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-cyan-400 hover:underline transition-colors cursor-pointer"
                                                                                >
                                                                                    {member.nickname || member.name}
                                                                                </Link>
                                                                                {member._id === currentUserId && (
                                                                                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide">You</span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            {pred ? (
                                                                                <div className="flex flex-col items-center">
                                                                                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                                                                                        {pred.homeScore} - {pred.awayScore}
                                                                                    </span>
                                                                                    {isKnockout && pred.penaltyPrediction && (
                                                                                        <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5 whitespace-nowrap">
                                                                                            {winnerName ? `PK: ${winnerName}` : "PK Picked"}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-xs text-gray-400 dark:text-gray-600 font-medium">-</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            {pred ? (
                                                                                <span className={`inline-block text-[10px] px-2 py-0.5 rounded ${pointsStyle}`}>
                                                                                    +{pred.points} PTS
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">-</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20 pt-4">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white dark:bg-slate-900/60 shadow-3xs"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Prev
                                    </button>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Page <span className="font-bold text-gray-800 dark:text-gray-200">{currentPage}</span> of{" "}
                                        <span className="font-bold text-gray-800 dark:text-gray-200">{totalPages}</span>
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white dark:bg-slate-900/60 shadow-3xs"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
