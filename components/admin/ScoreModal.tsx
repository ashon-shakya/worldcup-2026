"use client";

import { updateMatchScore } from "@/app/actions/admin/matches";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

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

export default function ScoreModal({ match, onClose }: { match: any, onClose: () => void }) {
    const updateMatchWithId = updateMatchScore.bind(null, match._id);
    const [state, dispatch] = useActionState(updateMatchWithId, null);

    useEffect(() => {
        if (state?.message === "success") {
            onClose();
        }
    }, [state, onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm text-gray-900">
                <h2 className="text-lg font-bold mb-4 text-gray-900">Enter Score</h2>
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex flex-col items-center">
                        {match.homeTeam?.flagUrl && (
                            <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="w-12 h-8 object-cover rounded shadow-sm mb-2" />
                        )}
                        <span className="font-bold text-gray-900">{match.homeTeam?.name}</span>
                    </div>
                    <span className="text-gray-400 font-bold">vs</span>
                    <div className="flex flex-col items-center">
                        {match.awayTeam?.flagUrl && (
                            <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="w-12 h-8 object-cover rounded shadow-sm mb-2" />
                        )}
                        <span className="font-bold text-gray-900">{match.awayTeam?.name}</span>
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

                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}
