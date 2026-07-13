"use client";

import { submitPrediction } from "@/app/actions/predictions";
import { useActionState, useEffect, useState } from "react";
import { isKnockoutStage } from "@/lib/constants";
import { useFormStatus } from "react-dom";
import { Calendar, Lock, CheckCircle, HelpCircle, ChevronDown } from "lucide-react";
import TeamMatchesModal from "./TeamMatchesModal";
import LocalTime from "@/components/ui/LocalTime";
import { calculateSpecialPoints, isEventEnabled } from "@/lib/scoring";

function SubmitButton({ isLocked, isDisabled }: { isLocked: boolean; isDisabled?: boolean }) {
    const { pending } = useFormStatus();

    if (isLocked) {
        return (
            <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded-full cursor-not-allowed text-sm font-bold flex items-center">
                <Lock size={14} className="mr-1" /> Locked
            </button>
        );
    }

    return (
        <button
            type="submit"
            disabled={pending || isDisabled}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? "Saving..." : "Predict"}
        </button>
    );
}

function getPointRuleText(correct: number | undefined, incorrect: number | undefined) {
    const c = correct ?? 3;
    const i = incorrect ?? -2;
    if (c === Math.abs(i)) {
        return `+/- ${c} pts`;
    }
    return `+${c}/${i >= 0 ? "+" : ""}${i} pts`;
}

interface MatchCardProps {
    match: any;
    prediction?: {
        homeScore: number,
        awayScore: number,
        points?: number,
        penaltyPrediction?: boolean,
        predictedWinner?: string,
        spRedCards?: boolean | null,
        spTotalCards?: string | null,
        spExtraTime?: boolean | null,
        spInGamePenalty?: boolean | null,
        spOwnGoal?: boolean | null,
        spFirstTeamToScore?: string | null
    };
    settings?: any;
}

export default function MatchCard({ match, prediction, settings }: MatchCardProps) {
    const [state, dispatch] = useActionState(submitPrediction, null);
    const [showPenaltyInput, setShowPenaltyInput] = useState(prediction?.penaltyPrediction || false);
    const [homeScore, setHomeScore] = useState(prediction?.homeScore?.toString() || "");
    const [awayScore, setAwayScore] = useState(prediction?.awayScore?.toString() || "");
    const [predictedWinner, setPredictedWinner] = useState(prediction?.predictedWinner || "");
    const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<{ title: string; desc: string } | null>(null);

    const isSpecialEnabled = (settings?.spStages?.includes(match.stage) ?? true) && (
        isEventEnabled(match.stage, "spRedCards", settings) ||
        isEventEnabled(match.stage, "spTotalCards", settings) ||
        isEventEnabled(match.stage, "spExtraTime", settings) ||
        isEventEnabled(match.stage, "spInGamePenalty", settings) ||
        isEventEnabled(match.stage, "spOwnGoal", settings) ||
        isEventEnabled(match.stage, "spFirstTeamToScore", settings)
    );
    const [showSpecialPanel, setShowSpecialPanel] = useState(
        !!(prediction && (
            prediction.spRedCards !== null ||
            prediction.spTotalCards !== null ||
            prediction.spExtraTime !== null ||
            prediction.spInGamePenalty !== null ||
            prediction.spOwnGoal !== null ||
            prediction.spFirstTeamToScore !== null
        ))
    );

    useEffect(() => {
        setShowPenaltyInput(prediction?.penaltyPrediction || false);
        setHomeScore(prediction?.homeScore?.toString() || "");
        setAwayScore(prediction?.awayScore?.toString() || "");
        setPredictedWinner(prediction?.predictedWinner || "");
        setShowSpecialPanel(
            !!(prediction && (
                prediction.spRedCards !== null ||
                prediction.spTotalCards !== null ||
                prediction.spExtraTime !== null ||
                prediction.spInGamePenalty !== null ||
                prediction.spOwnGoal !== null ||
                prediction.spFirstTeamToScore !== null
            ))
        );
    }, [prediction]);

    const isDraw = homeScore !== "" && awayScore !== "" && Number(homeScore) === Number(awayScore);

    // Check if locked (within 5 mins of kickoff)
    const isLocked = new Date() > new Date(new Date(match.kickOff).getTime() - 5 * 60000);
    const isFinished = match.status === "FINISHED";

    const isKnockout = match.isKnockout || isKnockoutStage(match.stage);

    useEffect(() => {
        if (isKnockout && isDraw) {
            setShowPenaltyInput(true);
        } else if (!isDraw) {
            setShowPenaltyInput(false);
            setPredictedWinner("");
        }
    }, [isKnockout, isDraw]);

    const isPenaltyWinnerRequired = isKnockout && isDraw && !predictedWinner;

    const hasExistingPrediction = prediction && prediction.homeScore !== undefined && prediction.homeScore !== null;
    const isSaved = state?.message === "success" || (
        !!hasExistingPrediction &&
        !state?.message &&
        homeScore === prediction?.homeScore?.toString() &&
        awayScore === prediction?.awayScore?.toString() &&
        (!isKnockout ? true : showPenaltyInput === (prediction?.penaltyPrediction || false) && (showPenaltyInput ? predictedWinner === prediction?.predictedWinner : true))
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 hover:shadow-md transition-shadow">
            {/* Header: Date & Venue */}
            <div className="bg-gray-55 px-6 py-3 border-b border-gray-100 flex justify-between items-center text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <div className="flex items-center">
                    <Calendar size={14} className="mr-2" />
                    <LocalTime date={match.kickOff} />
                </div>
                <span>{match.stage} • {match.venue}</span>
            </div>

            <div className="px-2 py-4 sm:p-6">
                <form
                    key={JSON.stringify(prediction)}
                    action={dispatch}
                    className="w-full flex flex-col gap-4"
                >
                    <input type="hidden" name="matchId" value={match._id} />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 w-full">
                        {/* Matchup row: always horizontal */}
                        <div className="flex flex-row items-center justify-between flex-1 w-full gap-2 sm:gap-4">
                            {/* Home Team */}
                            <div className={`flex flex-col items-center w-[30%] sm:w-1/3 p-1 sm:p-2 rounded-lg transition-all duration-300 ${isFinished && match.winner && match.winner._id === match.homeTeam?._id
                                ? "bg-yellow-50 ring-2 ring-yellow-400 scale-105 shadow-lg"
                                : isFinished && match.winner
                                    ? "opacity-50 grayscale scale-95"
                                    : ""
                                }`}>
                                {match.homeTeam?.flagUrl && (
                                    <img
                                        src={match.homeTeam.flagUrl}
                                        alt={match.homeTeam.name}
                                        title={`Click to view ${match.homeTeam.name} matches`}
                                        onClick={() => setSelectedTeam({ id: match.homeTeam._id, name: match.homeTeam.name })}
                                        className="w-10 h-7 sm:w-12 sm:h-9 object-cover rounded shadow-sm mb-1.5 sm:mb-2 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200 animate-pulse-on-hover"
                                    />
                                )}
                                <span className={`text-xs sm:text-sm md:text-base font-bold text-center ${isFinished && match.winner && match.winner._id === match.homeTeam?._id ? "text-yellow-700 font-black" : "text-gray-900"
                                    }`}>
                                    {match.homeTeam?.name}
                                    {isFinished && match.winner && match.winner._id === match.homeTeam?._id && (
                                        <span className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-yellow-600 mt-0.5 sm:mt-1">Winner</span>
                                    )}
                                </span>
                            </div>

                            {/* Prediction Inputs / Score Display */}
                            <div className="flex flex-col items-center flex-1 min-w-0">
                                {isLocked || isFinished ? (
                                    <div className="text-center">
                                        <div className="text-2xl sm:text-3xl font-black text-gray-800 flex items-center justify-center gap-2 sm:gap-4">
                                            <span>{match.status === "FINISHED" ? match.homeScore : (prediction?.homeScore ?? "-")}</span>
                                            <span className="text-gray-300 text-base sm:text-lg">vs</span>
                                            <span>{match.status === "FINISHED" ? match.awayScore : (prediction?.awayScore ?? "-")}</span>
                                        </div>
                                        {prediction && (
                                            <div className="flex flex-col items-center gap-1 mt-1.5 sm:mt-2">
                                                <div className="text-xs sm:text-sm text-indigo-650 dark:text-indigo-300 font-medium bg-indigo-50 dark:bg-indigo-955/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-transparent dark:border-indigo-900/30 whitespace-nowrap">
                                                    Your Pick: {prediction.homeScore} - {prediction.awayScore}
                                                </div>
                                                {isKnockout && prediction.penaltyPrediction && prediction.predictedWinner && (
                                                    <div className="text-[9px] sm:text-[10px] font-bold text-purple-650 dark:text-purple-300 bg-purple-50 dark:bg-purple-955/30 px-1.5 sm:px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900/30 whitespace-nowrap">
                                                        PK Pick: {match.homeTeam?._id?.toString() === prediction.predictedWinner?.toString() ? match.homeTeam?.name : match.awayTeam?._id?.toString() === prediction.predictedWinner?.toString() ? match.awayTeam?.name : "Unknown"}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {isFinished && prediction && prediction.points !== undefined && (() => {
                                            const specialPoints = calculateSpecialPoints(match.stage, prediction, match, settings);
                                            const matchPoints = prediction.points - specialPoints;
                                            return (
                                                <div className="mt-1 text-xs sm:text-sm font-bold text-gray-550 flex flex-col items-center gap-0.5">
                                                    <span className={prediction.points >= 0 ? "text-emerald-600" : "text-rose-600"}>
                                                        {prediction.points >= 0 ? "+" : ""}{prediction.points} PTS Total
                                                    </span>
                                                    <span className="text-[11px] text-gray-405 dark:text-gray-555 font-medium">
                                                        (Match: <span className={matchPoints >= 0 ? "text-emerald-600" : "text-rose-600"}>{matchPoints >= 0 ? `+${matchPoints}` : matchPoints}</span> | Special: <span className={specialPoints >= 0 ? "text-emerald-600" : "text-rose-600"}>{specialPoints >= 0 ? `+${specialPoints}` : specialPoints}</span>)
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                        {isFinished && isKnockout && match.wentToPenalties && (
                                            <div className="mt-1 text-[11px] sm:text-xs font-bold text-purple-655 dark:text-purple-300 bg-purple-50 dark:bg-purple-955/30 px-1.5 sm:px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900/30 uppercase tracking-wide whitespace-nowrap">
                                                Won on Penalties
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 sm:gap-3">
                                        <input
                                            type="number"
                                            name="homeScore"
                                            min="0"
                                            value={homeScore}
                                            onChange={(e) => setHomeScore(e.target.value)}
                                            className="w-12 h-10 sm:w-20 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-0 appearance-none bg-gray-50 text-gray-900 p-0"
                                            placeholder="-"
                                        />
                                        <span className="text-gray-300 font-bold">-</span>
                                        <input
                                            type="number"
                                            name="awayScore"
                                            min="0"
                                            value={awayScore}
                                            onChange={(e) => setAwayScore(e.target.value)}
                                            className="w-12 h-10 sm:w-20 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-0 appearance-none bg-gray-50 text-gray-900 p-0"
                                            placeholder="-"
                                        />
                                    </div>
                                )}
                                {/* Penalty Prediction - Only for Knockout Matches & Active Prediction Phase */}
                                {isKnockout && !isLocked && !isFinished && isDraw && (
                                    <div className="mt-3 sm:mt-4 flex flex-col items-center gap-2 sm:gap-3 w-full">
                                        <label className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs font-medium text-gray-400 cursor-not-allowed bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 opacity-70 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                disabled
                                                checked={true}
                                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-650 focus:ring-indigo-500 border-gray-300 rounded cursor-not-allowed"
                                            />
                                            <input type="hidden" name="penaltyPrediction" value="true" />
                                            <span>Decides on Penalties?</span>
                                        </label>

                                        <div className="flex flex-col items-center gap-1 w-full">
                                            <select
                                                name="predictedWinner"
                                                value={predictedWinner}
                                                onChange={(e) => setPredictedWinner(e.target.value)}
                                                className={`text-[10px] sm:text-xs w-full max-w-[150px] sm:max-w-[200px] rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white text-gray-900 py-1 px-2 transition-all ${isPenaltyWinnerRequired
                                                    ? "border-amber-400 bg-amber-50/30 text-amber-900 animate-pulse"
                                                    : "border-gray-200"
                                                    }`}
                                            >
                                                <option value="" disabled>Select Winner</option>
                                                <option value={match.homeTeam?._id}>{match.homeTeam?.name}</option>
                                                <option value={match.awayTeam?._id}>{match.awayTeam?.name}</option>
                                            </select>
                                            {isPenaltyWinnerRequired && (
                                                <span className="text-[9px] text-amber-600 font-medium">Winner selection required</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Display Penalty Prediction if Locked/Finished */}
                                {isKnockout && (isLocked || isFinished) && (
                                    <div className="mt-2 flex flex-col items-center gap-1">
                                        <div className="text-[10px] sm:text-xs font-medium text-gray-500 whitespace-nowrap">
                                            Predicted Penalties: <span className={prediction?.penaltyPrediction ? "text-purple-650 dark:text-purple-400 font-bold" : ""}>{prediction?.penaltyPrediction ? "Yes" : "No"}</span>
                                        </div>
                                        {prediction?.penaltyPrediction && prediction.predictedWinner && (
                                            <div className="text-[9px] sm:text-[10px] text-purple-650 dark:text-purple-300 bg-purple-50 dark:bg-purple-955/30 px-1.5 sm:px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900/30 font-bold uppercase tracking-wide whitespace-nowrap">
                                                Winner Pick: {match.homeTeam?._id === prediction.predictedWinner ? match.homeTeam?.name : match.awayTeam?._id === prediction.predictedWinner ? match.awayTeam?.name : "Unknown"}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Away Team */}
                            <div className={`flex flex-col items-center w-[30%] sm:w-1/3 p-1 sm:p-2 rounded-lg transition-all duration-300 ${isFinished && match.winner && match.winner._id === match.awayTeam?._id
                                ? "bg-yellow-50 ring-2 ring-yellow-400 scale-105 shadow-lg"
                                : isFinished && match.winner
                                    ? "opacity-50 grayscale scale-95"
                                    : ""
                                }`}>
                                {match.awayTeam?.flagUrl && (
                                    <img
                                        src={match.awayTeam.flagUrl}
                                        alt={match.awayTeam.name}
                                        title={`Click to view ${match.awayTeam.name} matches`}
                                        onClick={() => setSelectedTeam({ id: match.awayTeam._id, name: match.awayTeam.name })}
                                        className="w-10 h-7 sm:w-12 sm:h-9 object-cover rounded shadow-sm mb-1.5 sm:mb-2 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200 animate-pulse-on-hover"
                                    />
                                )}
                                <span className={`text-xs sm:text-sm md:text-base font-bold text-center ${isFinished && match.winner && match.winner._id === match.awayTeam?._id ? "text-yellow-700 font-black" : "text-gray-900"
                                    }`}>
                                    {match.awayTeam?.name}
                                    {isFinished && match.winner && match.winner._id === match.awayTeam?._id && (
                                        <span className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-yellow-600 mt-0.5 sm:mt-1">Winner</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Action Button */}
                        {(!isLocked && !isFinished) && (
                            <div className="w-full md:w-auto flex justify-center mt-2 md:mt-0 shrink-0">
                                <SubmitButton isLocked={isLocked} isDisabled={isPenaltyWinnerRequired} />
                            </div>
                        )}
                    </div>

                    {/* Collapsible Special Event Predictions Section */}
                    {isSpecialEnabled && (
                        <div className="border-t border-gray-100 pt-3 mt-1 w-full">
                            <button
                                type="button"
                                onClick={() => setShowSpecialPanel(!showSpecialPanel)}
                                className="flex items-center justify-between w-full text-xs font-semibold text-indigo-650 hover:text-indigo-800 transition-colors py-1 focus:outline-none"
                            >
                                <span className="flex items-center gap-1.5">
                                    ✨ Special Event Predictions (Optional)
                                    {prediction && (prediction.spRedCards !== null || prediction.spTotalCards !== null || prediction.spExtraTime !== null || prediction.spInGamePenalty !== null || prediction.spOwnGoal !== null || prediction.spFirstTeamToScore !== null) && (
                                        <span className="bg-indigo-50 border border-indigo-250 text-indigo-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Predicted</span>
                                    )}
                                </span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showSpecialPanel ? "rotate-180" : ""}`} />
                            </button>
                            {showSpecialPanel && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-3 bg-gray-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800 text-xs w-full">
                                    {/* Red Cards */}
                                    {isEventEnabled(match.stage, "spRedCards", settings) && (
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <label className="font-bold text-gray-700 dark:text-slate-300 flex flex-wrap items-center gap-0.5 text-sm">
                                                <span>Red Cards?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTooltip({
                                                        title: "Red Cards?",
                                                        desc: "Predict if any player (on the pitch or on the bench) will be shown a red card during the match."
                                                    })}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                                                >
                                                    <HelpCircle size={10} />
                                                </button>
                                                <span className="font-normal text-[11px] text-gray-400 dark:text-gray-550 ml-1">
                                                    ({getPointRuleText(settings?.spRedCardsCorrect, settings?.spRedCardsIncorrect)})
                                                </span>
                                            </label>
                                            {isLocked || isFinished ? (
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                                                        {prediction?.spRedCards === null ? "None" : prediction?.spRedCards ? "Yes" : "No"}
                                                    </span>
                                                    {isFinished && prediction?.spRedCards !== null && match.spRedCards !== null && (() => {
                                                        const isCorrect = prediction?.spRedCards === match.spRedCards;
                                                        const val = isCorrect ? (settings?.spRedCardsCorrect ?? 3) : (settings?.spRedCardsIncorrect ?? -2);
                                                        return (
                                                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-455 border border-rose-200 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <select
                                                    name="spRedCards"
                                                    defaultValue={prediction?.spRedCards?.toString() ?? ""}
                                                    className="rounded-lg border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 py-1 px-1.5 focus:ring-1 focus:ring-indigo-500 text-xs w-full"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                            )}
                                        </div>
                                    )}

                                    {/* Total Cards */}
                                    {isEventEnabled(match.stage, "spTotalCards", settings) && (
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <label className="font-bold text-gray-700 dark:text-slate-300 flex flex-wrap items-center gap-0.5 text-sm">
                                                <span>Total Cards?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTooltip({
                                                        title: "Total Cards?",
                                                        desc: "Predict whether the total yellow + red cards shown to both teams will be Under 5 or 5 and over (a red card counts as 1 card)."
                                                    })}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                                                >
                                                    <HelpCircle size={10} />
                                                </button>
                                                <span className="font-normal text-[11px] text-gray-400 dark:text-gray-550 ml-1">
                                                    ({getPointRuleText(settings?.spTotalCardsCorrect, settings?.spTotalCardsIncorrect)})
                                                </span>
                                            </label>
                                            {isLocked || isFinished ? (
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                                                        {prediction?.spTotalCards === null ? "None" : prediction?.spTotalCards === "UNDER" ? "Under 5" : "5 and over"}
                                                    </span>
                                                    {isFinished && prediction?.spTotalCards !== null && match.spTotalCards !== null && (() => {
                                                        const isCorrect = prediction?.spTotalCards === match.spTotalCards;
                                                        const val = isCorrect ? (settings?.spTotalCardsCorrect ?? 3) : (settings?.spTotalCardsIncorrect ?? -2);
                                                        return (
                                                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-455 border border-rose-200 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <select
                                                    name="spTotalCards"
                                                    defaultValue={prediction?.spTotalCards ?? ""}
                                                    className="rounded-lg border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 py-1 px-1.5 focus:ring-1 focus:ring-indigo-500 text-xs w-full"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="UNDER">Under 5</option>
                                                    <option value="OVER">5 and over</option>
                                                </select>
                                            )}
                                        </div>
                                    )}

                                    {/* Extra Time */}
                                    {isEventEnabled(match.stage, "spExtraTime", settings) && (
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <label className="font-bold text-gray-700 dark:text-slate-300 flex flex-wrap items-center gap-0.5 text-sm">
                                                <span>Extra Time?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTooltip({
                                                        title: "Extra Time?",
                                                        desc: "Predict if the match will go to extra time (the score at the end of 90 minutes is a tie)."
                                                    })}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                                                >
                                                    <HelpCircle size={10} />
                                                </button>
                                                <span className="font-normal text-[11px] text-gray-400 dark:text-gray-555 ml-1">
                                                    ({getPointRuleText(settings?.spExtraTimeCorrect, settings?.spExtraTimeIncorrect)})
                                                </span>
                                            </label>
                                            {isLocked || isFinished ? (
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                                                        {prediction?.spExtraTime === null ? "None" : prediction?.spExtraTime ? "Yes" : "No"}
                                                    </span>
                                                    {isFinished && prediction?.spExtraTime !== null && match.spExtraTime !== null && (() => {
                                                        const isCorrect = prediction?.spExtraTime === match.spExtraTime;
                                                        const val = isCorrect ? (settings?.spExtraTimeCorrect ?? 3) : (settings?.spExtraTimeIncorrect ?? -2);
                                                        return (
                                                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-455 border border-rose-200 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <select
                                                    name="spExtraTime"
                                                    defaultValue={prediction?.spExtraTime?.toString() ?? ""}
                                                    className="rounded-lg border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 py-1 px-1.5 focus:ring-1 focus:ring-indigo-500 text-xs w-full"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                            )}
                                        </div>
                                    )}

                                    {/* In Game Penalty */}
                                    {isEventEnabled(match.stage, "spInGamePenalty", settings) && (
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <label className="font-bold text-gray-700 dark:text-slate-300 flex flex-wrap items-center gap-0.5 text-sm">
                                                <span>In-Game PK?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTooltip({
                                                        title: "In-Game PK?",
                                                        desc: "Predict if any penalty kick is awarded and taken during normal play or extra time (excluding shootouts)."
                                                    })}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                                                >
                                                    <HelpCircle size={10} />
                                                </button>
                                                <span className="font-normal text-[11px] text-gray-400 dark:text-gray-555 ml-1">
                                                    ({getPointRuleText(settings?.spInGamePenaltyCorrect, settings?.spInGamePenaltyIncorrect)})
                                                </span>
                                            </label>
                                            {isLocked || isFinished ? (
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                                                        {prediction?.spInGamePenalty === null ? "None" : prediction?.spInGamePenalty ? "Yes" : "No"}
                                                    </span>
                                                    {isFinished && prediction?.spInGamePenalty !== null && match.spInGamePenalty !== null && (() => {
                                                        const isCorrect = prediction?.spInGamePenalty === match.spInGamePenalty;
                                                        const val = isCorrect ? (settings?.spInGamePenaltyCorrect ?? 3) : (settings?.spInGamePenaltyIncorrect ?? -2);
                                                        return (
                                                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-455 border border-rose-200 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <select
                                                    name="spInGamePenalty"
                                                    defaultValue={prediction?.spInGamePenalty?.toString() ?? ""}
                                                    className="rounded-lg border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 py-1 px-1.5 focus:ring-1 focus:ring-indigo-500 text-xs w-full"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                            )}
                                        </div>
                                    )}

                                    {/* Own Goal */}
                                    {isEventEnabled(match.stage, "spOwnGoal", settings) && (
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <label className="font-bold text-gray-700 dark:text-slate-300 flex flex-wrap items-center gap-0.5 text-sm">
                                                <span>Own Goal?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTooltip({
                                                        title: "Own Goal?",
                                                        desc: "Predict if any player scores a goal against their own team during normal play or extra time."
                                                    })}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                                                >
                                                    <HelpCircle size={10} />
                                                </button>
                                                <span className="font-normal text-[11px] text-gray-400 dark:text-gray-555 ml-1">
                                                    ({getPointRuleText(settings?.spOwnGoalCorrect, settings?.spOwnGoalIncorrect)})
                                                </span>
                                            </label>
                                            {isLocked || isFinished ? (
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                                                        {prediction?.spOwnGoal === null ? "None" : prediction?.spOwnGoal ? "Yes" : "No"}
                                                    </span>
                                                    {isFinished && prediction?.spOwnGoal !== null && match.spOwnGoal !== null && (() => {
                                                        const isCorrect = prediction?.spOwnGoal === match.spOwnGoal;
                                                        const val = isCorrect ? (settings?.spOwnGoalCorrect ?? 3) : (settings?.spOwnGoalIncorrect ?? -2);
                                                        return (
                                                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-455 border border-rose-200 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <select
                                                    name="spOwnGoal"
                                                    defaultValue={prediction?.spOwnGoal?.toString() ?? ""}
                                                    className="rounded-lg border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 py-1 px-1.5 focus:ring-1 focus:ring-indigo-500 text-xs w-full"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                            )}
                                        </div>
                                    )}

                                    {/* First Team to Score */}
                                    {isEventEnabled(match.stage, "spFirstTeamToScore", settings) && (
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <label className="font-bold text-gray-700 dark:text-slate-300 flex flex-wrap items-center gap-0.5 text-sm">
                                                <span>1st to Score?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTooltip({
                                                        title: "1st to Score?",
                                                        desc: "Predict which team will score the first goal of the match. You can select 'No Goal' if you predict a 0-0 score."
                                                    })}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                                                >
                                                    <HelpCircle size={10} />
                                                </button>
                                                <span className="font-normal text-[11px] text-gray-400 dark:text-gray-550 ml-1">
                                                    ({getPointRuleText(settings?.spFirstTeamScoreCorrect, settings?.spFirstTeamScoreIncorrect)})
                                                </span>
                                            </label>
                                            {isLocked || isFinished ? (
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-200 truncate w-full">
                                                        {prediction?.spFirstTeamToScore === null ? "None" :
                                                            prediction?.spFirstTeamToScore?.toString() === match.homeTeam?._id?.toString() ? match.homeTeam?.name :
                                                                prediction?.spFirstTeamToScore?.toString() === match.awayTeam?._id?.toString() ? match.awayTeam?.name : "No Goal"}
                                                    </span>
                                                    {isFinished && prediction?.spFirstTeamToScore !== null && match.spFirstTeamToScore !== null && (() => {
                                                        const isCorrect = prediction?.spFirstTeamToScore?.toString() === match.spFirstTeamToScore?.toString();
                                                        const val = isCorrect ? (settings?.spFirstTeamScoreCorrect ?? 3) : (settings?.spFirstTeamScoreIncorrect ?? -2);
                                                        return (
                                                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-455 border border-rose-200 dark:border-rose-900/30"}`}>
                                                                {isCorrect ? "Correct" : "Incorrect"} ({val >= 0 ? "+" : ""}{val})
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <select
                                                    name="spFirstTeamToScore"
                                                    defaultValue={prediction?.spFirstTeamToScore ?? ""}
                                                    className="rounded-lg border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 py-1 px-1.5 focus:ring-1 focus:ring-indigo-500 text-xs w-full"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value={match.homeTeam?._id}>{match.homeTeam?.name}</option>
                                                    <option value={match.awayTeam?._id}>{match.awayTeam?.name}</option>
                                                    <option value="none">No Goal</option>
                                                </select>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </form>

                {state?.message && state.message !== "success" && (
                    <p className="text-red-500 text-xs text-center mt-2">{state.message}</p>
                )}
                {isSaved && (
                    <p className="text-green-600 text-xs text-center mt-2 flex items-center justify-center font-medium">
                        <CheckCircle size={12} className="mr-1" /> Saved
                    </p>
                )}
            </div>

            {selectedTeam && (
                <TeamMatchesModal
                    teamId={selectedTeam.id}
                    teamName={selectedTeam.name}
                    onClose={() => setSelectedTeam(null)}
                />
            )}

            {activeTooltip && (
                <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-gray-100 dark:border-slate-800 shadow-2xl transform scale-100 transition-transform duration-200">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2 flex items-center gap-1.5">
                            <HelpCircle className="text-indigo-650" size={16} />
                            {activeTooltip.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{activeTooltip.desc}</p>
                        {["Red Cards?", "Total Cards?", "Extra Time?", "In-Game PK?", "Own Goal?", "1st to Score?"].includes(activeTooltip.title) && (
                            <div className="bg-amber-50/40 dark:bg-amber-800/10 border border-amber-100 dark:border-amber-950/20 text-amber-800 dark:text-amber-300 text-[11px] rounded-lg p-2.5 mb-5 flex items-start gap-1.5 font-medium leading-normal">
                                <span className="shrink-0 text-amber-500 font-bold">⚠️ Caution:</span>
                                <span>Incorrect predictions will result in negative points (e.g. -2 points).</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setActiveTooltip(null)}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-xs"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
