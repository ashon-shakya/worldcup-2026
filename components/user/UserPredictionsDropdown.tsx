"use client";

import { useEffect, useState } from "react";
import { getPublicPredictions } from "@/app/actions/predictions";
import { ChevronLeft, ChevronRight, Calendar, Clock, Trophy, HelpCircle } from "lucide-react";
import { isKnockoutStage } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { getPointSettings } from "@/app/actions/admin/settings";
import { calculateSpecialPoints, isEventEnabled } from "@/lib/scoring";
import LocalTime from "@/components/ui/LocalTime";

interface UserPredictionsDropdownProps {
    userId: string;
    isExpanded: boolean;
    allowedStages?: string[];
    stageMultipliers?: Record<string, number>;
}

export default function UserPredictionsDropdown({ userId, isExpanded, allowedStages, stageMultipliers }: UserPredictionsDropdownProps) {
    const [predictions, setPredictions] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const predictionsPerPage = 5;

    useEffect(() => {
        if (isExpanded && predictions.length === 0) {
            const fetchPredictions = async () => {
                setLoading(true);
                try {
                    const data = await getPublicPredictions(userId);
                    setPredictions(data);
                    const ptsSettings = await getPointSettings();
                    setSettings(ptsSettings);
                } catch (error) {
                    console.error("Error fetching predictions and settings:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPredictions();
        }
    }, [isExpanded, userId, predictions.length]);

    if (!isExpanded) return null;

    if (loading) {
        return (
            <div className="p-4 bg-gray-50/50 dark:bg-slate-950/40 border-t border-gray-100 dark:border-slate-800 space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse bg-white dark:bg-slate-900/60 border border-gray-150 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-6 bg-gray-200 dark:bg-slate-800 rounded"></div>
                            <div className="space-y-1.5">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-3 w-20 bg-gray-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-16 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
                            <div className="h-6 w-14 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (predictions.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-slate-950/40 border-t border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2">
                <HelpCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                <p className="font-medium text-sm">No predictions yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Only started or completed match predictions will appear here.</p>
            </div>
        );
    }

    const displayPredictions = allowedStages && allowedStages.length > 0
        ? predictions.filter((p: any) => p.match && allowedStages.includes(p.match.stage))
        : predictions;

    if (displayPredictions.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-slate-950/40 border-t border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2">
                <HelpCircle className="w-8 h-8 text-gray-400 dark:text-gray-550" />
                <p className="font-medium text-sm">No predictions in allowed rounds</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Only started or completed match predictions in allowed rounds will appear here.</p>
            </div>
        );
    }

    // Pagination calculations
    const indexOfLastPrediction = currentPage * predictionsPerPage;
    const indexOfFirstPrediction = indexOfLastPrediction - predictionsPerPage;
    const currentPredictions = displayPredictions.slice(indexOfFirstPrediction, indexOfLastPrediction);
    const totalPages = Math.ceil(displayPredictions.length / predictionsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    // Style helper for status badge
    const getStatusBadge = (status: string, kickOff: string) => {
        if (status === "FINISHED") {
            return (
                <span className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Finished
                </span>
            );
        }
        if (status === "LIVE") {
            return (
                <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    Live
                </span>
            );
        }
        // Scheduled but started
        return (
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Started
            </span>
        );
    };

    // Style helper for points display
    const getPointsBadge = (points: number, status: string, multiplier: number = 1) => {
        if (status !== "FINISHED" && status !== "LIVE") {
            return (
                <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 px-2 py-1 rounded-lg">
                    Pending
                </span>
            );
        }

        const multiplierText = multiplier !== 1 ? ` (x${multiplier})` : "";

        if (points >= 13) {
            return (
                <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                    <Trophy className="w-3.5 h-3.5" />
                    +{points} PTS{multiplierText}
                </span>
            );
        }
        if (points > 0) {
            return (
                <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 px-2.5 py-1 rounded-lg">
                    +{points} PTS{multiplierText}
                </span>
            );
        }
        if (points < 0) {
            return (
                <span className="text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-455 border border-rose-100 dark:border-rose-900/40 px-2.5 py-1 rounded-lg">
                    {points} PTS{multiplierText}
                </span>
            );
        }
        return (
            <span className="text-xs font-semibold bg-gray-50 dark:bg-slate-900/50 text-gray-400 dark:text-gray-550 border border-gray-100 dark:border-gray-800 px-2.5 py-1 rounded-lg">
                0 PTS{multiplierText}
            </span>
        );
    };

    return (
        <div className="bg-gray-50/50 dark:bg-slate-950/40 border-t border-gray-100 dark:border-slate-800 p-4 space-y-4">
            <div className="space-y-3">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                    >
                        {currentPredictions.map((pred: any) => {
                            const match = pred.match;
                            const isFinished = match.status === "FINISHED";
                            const isLive = match.status === "LIVE";
                            const hasActualScore = isFinished || isLive;

                            // Inferred Knockout Status (Fallback for legacy matches)
                            const isKnockout = match.isKnockout || isKnockoutStage(match.stage);

                            const multiplier = stageMultipliers && typeof stageMultipliers[match.stage] === "number"
                                ? stageMultipliers[match.stage]
                                : 1;
                            const multipliedPoints = (pred.points || 0) * multiplier;

                            const winnerName = (() => {
                                if (!pred.predictedWinner) return "";
                                if (typeof pred.predictedWinner === "object") {
                                    return pred.predictedWinner.name || "";
                                }
                                const winnerIdStr = pred.predictedWinner.toString();
                                if (winnerIdStr === match.homeTeam?._id?.toString()) return match.homeTeam?.name || "";
                                if (winnerIdStr === match.awayTeam?._id?.toString()) return match.awayTeam?.name || "";
                                return "";
                            })();

                            const showSpecialPredictions = !!(
                                (pred.spRedCards !== null && isEventEnabled(match.stage, "spRedCards", settings)) ||
                                (pred.spTotalCards !== null && isEventEnabled(match.stage, "spTotalCards", settings)) ||
                                (pred.spExtraTime !== null && isEventEnabled(match.stage, "spExtraTime", settings)) ||
                                (pred.spInGamePenalty !== null && isEventEnabled(match.stage, "spInGamePenalty", settings)) ||
                                (pred.spOwnGoal !== null && isEventEnabled(match.stage, "spOwnGoal", settings)) ||
                                (pred.spFirstTeamToScore !== null && isEventEnabled(match.stage, "spFirstTeamToScore", settings))
                            );

                            return (
                                <div
                                    key={pred._id}
                                    className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3 hover:shadow-xs transition-shadow duration-200"
                                >
                                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                                        {/* Left Panel: Match Meta */}
                                        <div className="flex flex-col gap-1 md:w-[180px] shrink-0">
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(match.status, match.kickOff)}
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-wide uppercase">
                                                    {match.stage}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mt-1">
                                                <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-gray-555" />
                                                <LocalTime date={match.kickOff} showTime={false} showDate={true} formatOptions={{ month: "short", day: "numeric" }} />
                                                <Clock className="w-3.5 h-3.5 ml-2.5 mr-1 text-gray-400 dark:text-gray-555" />
                                                <LocalTime date={match.kickOff} showTime={true} showDate={false} />
                                            </div>
                                        </div>

                                        {/* Middle Panel: Matchup and Scores */}
                                        <div className="flex items-center justify-center flex-1 py-2 px-3 bg-gray-50 dark:bg-slate-950/50 rounded-xl border border-gray-100 dark:border-slate-800/80">
                                            <div className="flex items-center justify-between w-full max-w-sm gap-2 text-xs sm:text-sm">
                                                {/* Home Team */}
                                                <div className="flex flex-col sm:flex-row items-center sm:justify-end flex-1 gap-1.5 sm:gap-2 text-center sm:text-right min-w-0">
                                                    <span className="font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[80px] sm:max-w-none order-2 sm:order-1">
                                                        {match.homeTeam?.name}
                                                    </span>
                                                    {match.homeTeam?.flagUrl && (
                                                        <img
                                                            src={match.homeTeam.flagUrl}
                                                            alt={match.homeTeam.name}
                                                            className="w-7 h-5 object-cover rounded shadow-2xs order-1 sm:order-2 border border-gray-200 dark:border-slate-800 shrink-0"
                                                        />
                                                    )}
                                                </div>

                                                {/* Scores Display */}
                                                <div className="flex flex-col items-center shrink-0 min-w-[100px] border-x border-gray-200/60 dark:border-slate-800 px-4">
                                                    {/* Actual Score */}
                                                    <div className="font-extrabold text-gray-900 dark:text-white text-base flex items-center gap-1.5">
                                                        <span>{hasActualScore ? match.homeScore : "-"}</span>
                                                        <span className="text-gray-300 dark:text-gray-600 text-xs font-normal">vs</span>
                                                        <span>{hasActualScore ? match.awayScore : "-"}</span>
                                                    </div>
                                                    {/* Predicted Score */}
                                                    <div className="flex flex-col items-center gap-1 mt-1">
                                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700/80 dark:text-indigo-300 px-1.5 py-0.5 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                                                            Pick: {pred.homeScore} - {pred.awayScore}
                                                        </div>
                                                        {isKnockout && pred.penaltyPrediction && winnerName && (
                                                            <div className="text-[9px] text-purple-650 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-955/30 px-1.5 py-0.5 rounded border border-purple-100/80 dark:border-purple-900/30 whitespace-nowrap">
                                                                PK Pick: {winnerName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Away Team */}
                                                <div className="flex flex-col sm:flex-row items-center sm:justify-start flex-1 gap-1.5 sm:gap-2 text-center sm:text-left min-w-0">
                                                    {match.awayTeam?.flagUrl && (
                                                        <img
                                                            src={match.awayTeam.flagUrl}
                                                            alt={match.awayTeam.name}
                                                            className="w-7 h-5 object-cover rounded shadow-2xs border border-gray-200 dark:border-slate-800 shrink-0"
                                                        />
                                                    )}
                                                    <span className="font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[80px] sm:max-w-none">
                                                        {match.awayTeam?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Panel: Points and Penalty Bonus details */}
                                        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end gap-2 md:w-[130px] shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 dark:border-slate-800">
                                            {/* Penalty Predictions Info */}
                                            {isKnockout && (pred.penaltyPrediction || (isFinished && match.wentToPenalties)) && (
                                                <div className="text-[10px] flex flex-col items-start md:items-end gap-0.5">
                                                    {isFinished && match.wentToPenalties && (
                                                        <div className="text-amber-700 dark:text-amber-600 bg-amber-50 dark:bg-amber-955/30 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/30 font-medium">
                                                            Winner: {typeof match.penaltyWinner === "object" && match.penaltyWinner ? match.penaltyWinner.name : (match.penaltyWinner?.toString() === match.homeTeam?._id?.toString() ? match.homeTeam?.name : match.awayTeam?.name)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex flex-col items-start md:items-end gap-1">
                                                {getPointsBadge(multipliedPoints, match.status, multiplier)}
                                                {isFinished && settings && (() => {
                                                    const specialPoints = calculateSpecialPoints(match.stage, pred, match, settings);
                                                    const multipliedSpecialPoints = specialPoints * multiplier;
                                                    const multipliedMatchPoints = multipliedPoints - multipliedSpecialPoints;
                                                    return (
                                                        <span className="text-[9px] text-gray-400 dark:text-gray-555 font-semibold mt-0.5 text-right whitespace-nowrap">
                                                            Match: <span className={multipliedMatchPoints >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-455"}>{multipliedMatchPoints >= 0 ? `+${multipliedMatchPoints}` : multipliedMatchPoints}</span> | Sp: <span className={multipliedSpecialPoints >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-455"}>{multipliedSpecialPoints >= 0 ? `+${multipliedSpecialPoints}` : multipliedSpecialPoints}</span>
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            {isKnockout && (pred.penaltyPrediction || (isFinished && match.wentToPenalties)) && (
                                                <div className="text-[10px] flex flex-col items-start md:items-end gap-0.5">
                                                    {pred.penaltyPrediction && winnerName && (
                                                        <div className="text-purple-650 dark:text-purple-400 bg-purple-50 dark:bg-purple-955/30 px-2 py-0.5 rounded border border-purple-100/80 dark:border-purple-900/30 font-bold tracking-wide">
                                                            Winner Pick: {winnerName}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Special Predictions Grid */}
                                    {showSpecialPredictions && (
                                        <div className="border-t border-gray-150 dark:border-slate-850 pt-2.5 mt-0.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-[10px] w-full">
                                            {/* Red Cards */}
                                            {pred.spRedCards !== null && isEventEnabled(match.stage, "spRedCards", settings) && (
                                                <div className="flex flex-col gap-0.5 bg-gray-50/50 dark:bg-slate-950/30 p-1.5 rounded border border-gray-100 dark:border-slate-800/80">
                                                    <span className="text-gray-400 dark:text-gray-550 font-medium">Red Cards?</span>
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                                        {pred.spRedCards ? "Yes" : "No"}
                                                    </span>
                                                    {isFinished && match.spRedCards !== null && (() => {
                                                        const isCorrect = pred.spRedCards === match.spRedCards;
                                                        const rawVal = isCorrect ? (settings?.spRedCardsCorrect ?? 3) : (settings?.spRedCardsIncorrect ?? -2);
                                                        const val = rawVal * multiplier;
                                                        return (
                                                            <span className={`px-1 py-0.2 rounded-[3px] text-[8px] font-bold text-center mt-0.5 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* Total Cards */}
                                            {pred.spTotalCards !== null && isEventEnabled(match.stage, "spTotalCards", settings) && (
                                                <div className="flex flex-col gap-0.5 bg-gray-50/50 dark:bg-slate-950/30 p-1.5 rounded border border-gray-100 dark:border-slate-800/80">
                                                    <span className="text-gray-400 dark:text-gray-550 font-medium">Total Cards?</span>
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                                        {pred.spTotalCards === "UNDER" ? "Under 5" : "5 and over"}
                                                    </span>
                                                    {isFinished && match.spTotalCards !== null && (() => {
                                                        const isCorrect = pred.spTotalCards === match.spTotalCards;
                                                        const rawVal = isCorrect ? (settings?.spTotalCardsCorrect ?? 3) : (settings?.spTotalCardsIncorrect ?? -2);
                                                        const val = rawVal * multiplier;
                                                        return (
                                                            <span className={`px-1 py-0.2 rounded-[3px] text-[8px] font-bold text-center mt-0.5 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* Extra Time */}
                                            {pred.spExtraTime !== null && isEventEnabled(match.stage, "spExtraTime", settings) && (
                                                <div className="flex flex-col gap-0.5 bg-gray-50/50 dark:bg-slate-950/30 p-1.5 rounded border border-gray-105 dark:border-slate-800/80">
                                                    <span className="text-gray-400 dark:text-gray-550 font-medium">Extra Time?</span>
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                                        {pred.spExtraTime ? "Yes" : "No"}
                                                    </span>
                                                    {isFinished && match.spExtraTime !== null && (() => {
                                                        const isCorrect = pred.spExtraTime === match.spExtraTime;
                                                        const rawVal = isCorrect ? (settings?.spExtraTimeCorrect ?? 3) : (settings?.spExtraTimeIncorrect ?? -2);
                                                        const val = rawVal * multiplier;
                                                        return (
                                                            <span className={`px-1 py-0.2 rounded-[3px] text-[8px] font-bold text-center mt-0.5 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* In Game Penalty */}
                                            {pred.spInGamePenalty !== null && isEventEnabled(match.stage, "spInGamePenalty", settings) && (
                                                <div className="flex flex-col gap-0.5 bg-gray-50/50 dark:bg-slate-950/30 p-1.5 rounded border border-gray-100 dark:border-slate-800/80">
                                                    <span className="text-gray-400 dark:text-gray-550 font-medium">In-Game PK?</span>
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                                        {pred.spInGamePenalty ? "Yes" : "No"}
                                                    </span>
                                                    {isFinished && match.spInGamePenalty !== null && (() => {
                                                        const isCorrect = pred.spInGamePenalty === match.spInGamePenalty;
                                                        const rawVal = isCorrect ? (settings?.spInGamePenaltyCorrect ?? 3) : (settings?.spInGamePenaltyIncorrect ?? -2);
                                                        const val = rawVal * multiplier;
                                                        return (
                                                            <span className={`px-1 py-0.2 rounded-[3px] text-[8px] font-bold text-center mt-0.5 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* Own Goal */}
                                            {pred.spOwnGoal !== null && isEventEnabled(match.stage, "spOwnGoal", settings) && (
                                                <div className="flex flex-col gap-0.5 bg-gray-50/50 dark:bg-slate-950/30 p-1.5 rounded border border-gray-105 dark:border-slate-800/80">
                                                    <span className="text-gray-400 dark:text-gray-550 font-medium">Own Goal?</span>
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                                        {pred.spOwnGoal ? "Yes" : "No"}
                                                    </span>
                                                    {isFinished && match.spOwnGoal !== null && (() => {
                                                        const isCorrect = pred.spOwnGoal === match.spOwnGoal;
                                                        const rawVal = isCorrect ? (settings?.spOwnGoalCorrect ?? 3) : (settings?.spOwnGoalIncorrect ?? -2);
                                                        const val = rawVal * multiplier;
                                                        return (
                                                            <span className={`px-1 py-0.2 rounded-[3px] text-[8px] font-bold text-center mt-0.5 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* First Team to Score */}
                                            {pred.spFirstTeamToScore !== null && isEventEnabled(match.stage, "spFirstTeamToScore", settings) && (
                                                <div className="flex flex-col gap-0.5 bg-gray-50/50 dark:bg-slate-950/30 p-1.5 rounded border border-gray-100 dark:border-slate-800/80">
                                                    <span className="text-gray-400 dark:text-gray-550 font-medium">1st to Score?</span>
                                                    <span className="font-bold text-gray-800 dark:text-gray-200 truncate">
                                                        {pred.spFirstTeamToScore?.toString() === match.homeTeam?._id?.toString() ? match.homeTeam?.name :
                                                         pred.spFirstTeamToScore?.toString() === match.awayTeam?._id?.toString() ? match.awayTeam?.name : "No Goal"}
                                                    </span>
                                                    {isFinished && match.spFirstTeamToScore !== null && (() => {
                                                        const isCorrect = pred.spFirstTeamToScore?.toString() === match.spFirstTeamToScore?.toString();
                                                        const rawVal = isCorrect ? (settings?.spFirstTeamScoreCorrect ?? 3) : (settings?.spFirstTeamScoreIncorrect ?? -2);
                                                        const val = rawVal * multiplier;
                                                        return (
                                                            <span className={`px-1 py-0.2 rounded-[3px] text-[8px] font-bold text-center mt-0.5 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
                    <button
                        id={`prev-btn-${userId}`}
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Prev
                    </button>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Page <span className="font-bold text-gray-800 dark:text-gray-200">{currentPage}</span> of{" "}
                        <span className="font-bold text-gray-800 dark:text-gray-200">{totalPages}</span>
                    </span>
                    <button
                        id={`next-btn-${userId}`}
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
