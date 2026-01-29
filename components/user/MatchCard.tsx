"use client";

import { submitPrediction } from "@/app/actions/predictions";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Calendar, Lock, CheckCircle } from "lucide-react";

function SubmitButton({ isLocked }: { isLocked: boolean }) {
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
            disabled={pending}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
            {pending ? "Saving..." : "Predict"}
        </button>
    );
}

interface MatchCardProps {
    match: any;
    prediction?: { homeScore: number, awayScore: number, points?: number, penaltyPrediction?: boolean, predictedWinner?: string };
}

export default function MatchCard({ match, prediction }: MatchCardProps) {
    const [state, dispatch] = useActionState(submitPrediction, null);
    const [showPenaltyInput, setShowPenaltyInput] = useState(prediction?.penaltyPrediction || false);
    const [homeScore, setHomeScore] = useState(prediction?.homeScore?.toString() || "");
    const [awayScore, setAwayScore] = useState(prediction?.awayScore?.toString() || "");

    useEffect(() => {
        setShowPenaltyInput(prediction?.penaltyPrediction || false);
        setHomeScore(prediction?.homeScore?.toString() || "");
        setAwayScore(prediction?.awayScore?.toString() || "");
    }, [prediction]);

    const isDraw = homeScore !== "" && awayScore !== "" && homeScore === awayScore;

    // Check if locked (within 5 mins of kickoff)
    const isLocked = new Date() > new Date(new Date(match.kickOff).getTime() - 5 * 60000);
    const isFinished = match.status === "FINISHED";

    // Inferred Knockout Status (Fallback for legacy matches)
    const isKnockoutStage = ["Round of 32", "Round of 16", "Quarter Final", "Semi Final", "Final", "3rd Place"].includes(match.stage);
    const isKnockout = match.isKnockout || isKnockoutStage;

    // If successfully saved, maybe show a toast or temporary visual cue. 
    // currently revalidatePath handles data refresh.

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 hover:shadow-md transition-shadow">
            {/* Header: Date & Venue */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <div className="flex items-center">
                    <Calendar size={14} className="mr-2" />
                    {new Date(match.kickOff).toLocaleString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <span>{match.stage} • {match.venue}</span>
            </div>

            <div className="p-6">
                <form
                    key={JSON.stringify(prediction)}
                    action={dispatch}
                    className="flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <input type="hidden" name="matchId" value={match._id} />

                    {/* Home Team */}
                    <div className={`flex flex-col items-center w-1/3 p-2 rounded-lg transition-all duration-300 ${isFinished && match.winner && match.winner._id === match.homeTeam?._id
                        ? "bg-yellow-50 ring-2 ring-yellow-400 scale-105 shadow-lg"
                        : isFinished && match.winner
                            ? "opacity-50 grayscale scale-95"
                            : ""
                        }`}>
                        {match.homeTeam?.flagUrl && (
                            <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="w-12 h-9 object-cover rounded shadow-sm mb-2" />
                        )}
                        <span className={`font-bold text-center ${isFinished && match.winner && match.winner._id === match.homeTeam?._id ? "text-yellow-700 font-black" : "text-gray-900"
                            }`}>
                            {match.homeTeam?.name}
                            {isFinished && match.winner && match.winner._id === match.homeTeam?._id && (
                                <span className="block text-[10px] uppercase tracking-widest text-yellow-600 mt-1">Winner</span>
                            )}
                        </span>
                    </div>

                    {/* Prediction Inputs / Score Display */}
                    <div className="flex flex-col items-center flex-1">
                        {isLocked || isFinished ? (
                            <div className="text-center">
                                <div className="text-3xl font-black text-gray-800 flex items-center justify-center gap-4">
                                    <span>{match.status === "FINISHED" ? match.homeScore : (prediction?.homeScore ?? "-")}</span>
                                    <span className="text-gray-300 text-lg">vs</span>
                                    <span>{match.status === "FINISHED" ? match.awayScore : (prediction?.awayScore ?? "-")}</span>
                                </div>
                                {prediction && (
                                    <div className="mt-2 text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                                        Your Pick: {prediction.homeScore} - {prediction.awayScore}
                                    </div>
                                )}
                                {isFinished && prediction && prediction.points !== undefined && (
                                    <div className="mt-1 text-xs font-bold text-green-600">
                                        +{prediction.points} PTS
                                    </div>
                                )}
                                {isFinished && isKnockout && match.wentToPenalties && (
                                    <div className="mt-1 text-[10px] sm:text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase tracking-wide">
                                        Won on Penalties
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    name="homeScore"
                                    min="0"
                                    value={homeScore}
                                    onChange={(e) => {
                                        setHomeScore(e.target.value);
                                        if (e.target.value !== awayScore) setShowPenaltyInput(false);
                                    }}
                                    className="w-20 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-0 appearance-none bg-gray-50 text-gray-900"
                                    placeholder="-"
                                />
                                <span className="text-gray-300 font-bold">-</span>
                                <input
                                    type="number"
                                    name="awayScore"
                                    min="0"
                                    value={awayScore}
                                    onChange={(e) => {
                                        setAwayScore(e.target.value);
                                        if (homeScore !== e.target.value) setShowPenaltyInput(false);
                                    }}
                                    className="w-20 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-0 appearance-none bg-gray-50 text-gray-900"
                                    placeholder="-"
                                />
                            </div>
                        )}
                        {/* Penalty Prediction - Only for Knockout Matches & Active Prediction Phase */}
                        {isKnockout && !isLocked && !isFinished && isDraw && (
                            <div className="mt-4 flex flex-col items-center gap-3 w-full">
                                <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="penaltyPrediction"
                                        value="true"
                                        checked={showPenaltyInput}
                                        onChange={(e) => setShowPenaltyInput(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span>Match decides on Penalties?</span>
                                </label>

                                {showPenaltyInput && (
                                    <select
                                        name="predictedWinner"
                                        defaultValue={prediction?.predictedWinner || ""}
                                        className="text-xs w-full max-w-[200px] border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-gray-900"
                                    >
                                        <option value="" disabled>Select Penalty Winner</option>
                                        <option value={match.homeTeam?._id}>{match.homeTeam?.name}</option>
                                        <option value={match.awayTeam?._id}>{match.awayTeam?.name}</option>
                                    </select>
                                )}
                            </div>
                        )}
                        {/* Display Penalty Prediction if Locked/Finished */}
                        {isKnockout && (isLocked || isFinished) && (
                            <div className="mt-2 flex flex-col items-center gap-1">
                                <div className="text-xs font-medium text-gray-500">
                                    Predicted Penalties: <span className={prediction?.penaltyPrediction ? "text-purple-600 font-bold" : ""}>{prediction?.penaltyPrediction ? "Yes" : "No"}</span>
                                </div>
                                {prediction?.penaltyPrediction && prediction.predictedWinner && (
                                    <div className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 font-bold uppercase tracking-wide">
                                        Winner Pick: {match.homeTeam?._id === prediction.predictedWinner ? match.homeTeam?.name : match.awayTeam?._id === prediction.predictedWinner ? match.awayTeam?.name : "Unknown"}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className={`flex flex-col items-center w-1/3 p-2 rounded-lg transition-all duration-300 ${isFinished && match.winner && match.winner._id === match.awayTeam?._id
                        ? "bg-yellow-50 ring-2 ring-yellow-400 scale-105 shadow-lg"
                        : isFinished && match.winner
                            ? "opacity-50 grayscale scale-95"
                            : ""
                        }`}>
                        {match.awayTeam?.flagUrl && (
                            <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="w-12 h-9 object-cover rounded shadow-sm mb-2" />
                        )}
                        <span className={`font-bold text-center ${isFinished && match.winner && match.winner._id === match.awayTeam?._id ? "text-yellow-700 font-black" : "text-gray-900"
                            }`}>
                            {match.awayTeam?.name}
                            {isFinished && match.winner && match.winner._id === match.awayTeam?._id && (
                                <span className="block text-[10px] uppercase tracking-widest text-yellow-600 mt-1">Winner</span>
                            )}
                        </span>
                    </div>

                    {/* Action Button */}
                    {(!isLocked && !isFinished) && (
                        <div className="w-full md:w-auto flex justify-center mt-4 md:mt-0">
                            <SubmitButton isLocked={isLocked} />
                        </div>
                    )}
                </form>

                {state?.message && state.message !== "success" && (
                    <p className="text-red-500 text-xs text-center mt-2">{state.message}</p>
                )}
                {state?.message === "success" && (
                    <p className="text-green-600 text-xs text-center mt-2 flex items-center justify-center font-medium">
                        <CheckCircle size={12} className="mr-1" /> Saved
                    </p>
                )}
            </div>
        </div>
    );
}
