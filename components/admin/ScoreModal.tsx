"use client";

import { updateMatchScore } from "@/app/actions/admin/matches";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { isEventEnabled } from "@/lib/scoring";
import { getPointSettings } from "@/app/actions/admin/settings";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
            {pending ? "Saving..." : "Update Score"}
        </button>
    );
}

export default function ScoreModal({ match, settings, onClose }: { match: any, settings?: any, onClose: () => void }) {
    const updateMatchWithId = updateMatchScore.bind(null, match._id);
    const [state, dispatch] = useActionState(updateMatchWithId, null);
    const [showPenaltyInput, setShowPenaltyInput] = useState(match.wentToPenalties || false);
    const [settingsState, setSettingsState] = useState<any>(settings || null);

    useEffect(() => {
        if (!settingsState) {
            const fetchSettings = async () => {
                try {
                    const ptsSettings = await getPointSettings();
                    setSettingsState(ptsSettings);
                } catch (e) {
                    console.error("Failed to fetch settings in ScoreModal:", e);
                }
            };
            fetchSettings();
        }
    }, [settingsState]);

    const settingsToUse = settingsState || settings;

    const hasAnySpecialEnabled = 
        isEventEnabled(match.stage, "spRedCards", settingsToUse) ||
        isEventEnabled(match.stage, "spTotalCards", settingsToUse) ||
        isEventEnabled(match.stage, "spExtraTime", settingsToUse) ||
        isEventEnabled(match.stage, "spInGamePenalty", settingsToUse) ||
        isEventEnabled(match.stage, "spOwnGoal", settingsToUse) ||
        isEventEnabled(match.stage, "spFirstTeamToScore", settingsToUse);

    useEffect(() => {
        if (state?.message === "success") {
            onClose();
        }
    }, [state, onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm text-gray-900 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4 text-gray-900">Enter Score</h2>
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex flex-col items-center">
                        {match.homeTeam?.flagUrl && (
                            <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="w-12 h-8 object-cover rounded shadow-sm mb-2" />
                        )}
                        <span className="font-bold text-gray-900 text-center">{match.homeTeam?.name}</span>
                    </div>
                    <span className="text-gray-400 font-bold">vs</span>
                    <div className="flex flex-col items-center">
                        {match.awayTeam?.flagUrl && (
                            <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="w-12 h-8 object-cover rounded shadow-sm mb-2" />
                        )}
                        <span className="font-bold text-gray-900 text-center">{match.awayTeam?.name}</span>
                    </div>
                </div>

                <form action={dispatch} className="space-y-4">
                    <div className="flex justify-center gap-4 items-center">
                        <div>
                            <input
                                type="number"
                                name="homeScore"
                                defaultValue={match.homeScore ?? 0}
                                className="block w-20 text-center rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                            />
                        </div>
                        <span className="text-xl font-bold">-</span>
                        <div>
                            <input
                                type="number"
                                name="awayScore"
                                defaultValue={match.awayScore ?? 0}
                                className="block w-20 text-center rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 mt-4">
                        <div className="flex items-center justify-center gap-2">
                            <input
                                type="checkbox"
                                id="wentToPenalties"
                                name="wentToPenalties"
                                checked={showPenaltyInput}
                                onChange={(e) => setShowPenaltyInput(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label htmlFor="wentToPenalties" className="text-sm font-medium leading-6 text-gray-900">
                                Went to Penalties?
                            </label>
                        </div>

                        {showPenaltyInput && (
                            <div>
                                <label htmlFor="penaltyWinner" className="block text-sm font-medium leading-6 text-gray-900 mb-1 text-center">
                                    Penalty Winner
                                </label>
                                <select
                                    id="penaltyWinner"
                                    name="penaltyWinner"
                                    defaultValue={match.penaltyWinner?._id || match.penaltyWinner || ""}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="">Select Winner...</option>
                                    <option value={match.homeTeam._id}>{match.homeTeam.name}</option>
                                    <option value={match.awayTeam._id}>{match.awayTeam.name}</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {hasAnySpecialEnabled && (
                        <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                            <h3 className="text-sm font-bold text-gray-800">Special Predictions Outcomes</h3>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                {isEventEnabled(match.stage, "spRedCards", settingsToUse) && (
                                    <div>
                                        <label htmlFor="spRedCards" className="block text-gray-700 font-medium mb-1">
                                            Red Cards?
                                        </label>
                                        <select
                                            id="spRedCards"
                                            name="spRedCards"
                                            defaultValue={match.spRedCards?.toString() ?? "false"}
                                            className="block w-full rounded-md border-gray-300 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-350 focus:ring-2 focus:ring-indigo-600 sm:text-xs"
                                        >
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                        </select>
                                    </div>
                                )}

                                {isEventEnabled(match.stage, "spTotalCards", settingsToUse) && (
                                    <div>
                                        <label htmlFor="spTotalCards" className="block text-gray-700 font-medium mb-1">
                                            Total Cards?
                                        </label>
                                        <select
                                            id="spTotalCards"
                                            name="spTotalCards"
                                            defaultValue={match.spTotalCards ?? "UNDER"}
                                            className="block w-full rounded-md border-gray-305 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-350 focus:ring-2 focus:ring-indigo-600 sm:text-xs"
                                        >
                                            <option value="UNDER">Under 5</option>
                                            <option value="OVER">5 and over</option>
                                        </select>
                                    </div>
                                )}

                                {isEventEnabled(match.stage, "spExtraTime", settingsToUse) && (
                                    <div>
                                        <label htmlFor="spExtraTime" className="block text-gray-700 font-medium mb-1">
                                            Extra Time?
                                        </label>
                                        <select
                                            id="spExtraTime"
                                            name="spExtraTime"
                                            defaultValue={match.spExtraTime?.toString() ?? "false"}
                                            className="block w-full rounded-md border-gray-305 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-350 focus:ring-2 focus:ring-indigo-600 sm:text-xs"
                                        >
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                        </select>
                                    </div>
                                )}

                                {isEventEnabled(match.stage, "spInGamePenalty", settingsToUse) && (
                                    <div>
                                        <label htmlFor="spInGamePenalty" className="block text-gray-700 font-medium mb-1">
                                            In-Game Penalty?
                                        </label>
                                        <select
                                            id="spInGamePenalty"
                                            name="spInGamePenalty"
                                            defaultValue={match.spInGamePenalty?.toString() ?? "false"}
                                            className="block w-full rounded-md border-gray-305 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-350 focus:ring-2 focus:ring-indigo-600 sm:text-xs"
                                        >
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                        </select>
                                    </div>
                                )}

                                {isEventEnabled(match.stage, "spOwnGoal", settingsToUse) && (
                                    <div>
                                        <label htmlFor="spOwnGoal" className="block text-gray-700 font-medium mb-1">
                                            Own Goal?
                                        </label>
                                        <select
                                            id="spOwnGoal"
                                            name="spOwnGoal"
                                            defaultValue={match.spOwnGoal?.toString() ?? "false"}
                                            className="block w-full rounded-md border-gray-305 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-350 focus:ring-2 focus:ring-indigo-600 sm:text-xs"
                                        >
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                        </select>
                                    </div>
                                )}

                                {isEventEnabled(match.stage, "spFirstTeamToScore", settingsToUse) && (
                                    <div>
                                        <label htmlFor="spFirstTeamToScore" className="block text-gray-700 font-medium mb-1">
                                            First Team to Score?
                                        </label>
                                        <select
                                            id="spFirstTeamToScore"
                                            name="spFirstTeamToScore"
                                            defaultValue={match.spFirstTeamToScore?._id || match.spFirstTeamToScore || ""}
                                            className="block w-full rounded-md border-gray-305 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-350 focus:ring-2 focus:ring-indigo-600 sm:text-xs"
                                        >
                                            <option value="none">No Team Scored</option>
                                            <option value={match.homeTeam?._id}>{match.homeTeam?.name}</option>
                                            <option value={match.awayTeam?._id}>{match.awayTeam?.name}</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}
