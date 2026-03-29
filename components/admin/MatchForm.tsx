"use client";

import { createMatch, updateMatch } from "@/app/actions/admin/matches";
import { getTeams } from "@/app/actions/admin/teams";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
            {pending ? "Saving..." : "Save Match"}
        </button>
    );
}

export default function MatchForm({ onClose, match }: { onClose?: () => void; match?: any }) {
    const actionToUse = match ? updateMatch.bind(null, match._id) : createMatch;
    const [state, dispatch] = useActionState(actionToUse, null);
    const [teams, setTeams] = useState<any[]>([]);

    useEffect(() => {
        // Fetch teams for the dropdown
        console.log(match)
        getTeams().then(setTeams);
    }, []);

    useEffect(() => {
        if (state?.message === "success") {
            if (onClose) onClose();
        }
    }, [state, onClose]);

    return (
        <form action={dispatch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="homeTeam" className="block text-sm font-medium leading-6 text-gray-900">
                        Home Team
                    </label>
                    <div className="mt-2">
                        <select
                            name="homeTeam"
                            id="homeTeam"
                            required
                            defaultValue={match?.homeTeam?._id || match?.homeTeam || ""}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                            <option value="">Select Team</option>
                            {teams.map(t => <option key={t._id} value={t._id} selected={t._id === match?.homeTeam?._id || t._id === match?.homeTeam}>{t.name}</option>)}
                        </select>
                    </div>
                    {state?.errors?.homeTeam && <p className="text-red-500 text-sm">{state.errors.homeTeam[0]}</p>}
                </div>

                <div>
                    <label htmlFor="awayTeam" className="block text-sm font-medium leading-6 text-gray-900">
                        Away Team
                    </label>
                    <div className="mt-2">
                        <select
                            name="awayTeam"
                            id="awayTeam"
                            required
                            defaultValue={match?.awayTeam?._id || match?.awayTeam || ""}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                            <option value="">Select Team</option>
                            {teams.map(t => <option key={t._id} value={t._id} selected={t._id === match?.awayTeam?._id || t._id === match?.awayTeam}>{t.name}</option>)}
                        </select>
                    </div>
                    {state?.errors?.awayTeam && <p className="text-red-500 text-sm">{state.errors.awayTeam[0]}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="kickOff" className="block text-sm font-medium leading-6 text-gray-900">
                    Kick Off Time
                </label>
                <div className="mt-2">
                    <input
                        type="datetime-local"
                        name="kickOff"
                        id="kickOff"
                        required
                        defaultValue={match?.kickOff ? new Date(match.kickOff).toISOString().slice(0, 16) : ""}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                    />
                </div>
                {state?.errors?.kickOff && <p className="text-red-500 text-sm">{state.errors.kickOff[0]}</p>}
            </div>

            <div>
                <label htmlFor="stage" className="block text-sm font-medium leading-6 text-gray-900">
                    Stage
                </label>
                <div className="mt-2">
                    <select
                        name="stage"
                        id="stage"
                        required
                        defaultValue={match?.stage || "Group Stage"}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        <option value="Group Stage">Group Stage</option>
                        <option value="Round of 32">Round of 32</option>
                        <option value="Round of 16">Round of 16</option>
                        <option value="Quarter Final">Quarter Final</option>
                        <option value="Semi Final">Semi Final</option>
                        <option value="Final">Final</option>
                    </select>
                </div>
                {state?.errors?.stage && <p className="text-red-500 text-sm">{state.errors.stage[0]}</p>}
            </div>

            <div>
                <label htmlFor="venue" className="block text-sm font-medium leading-6 text-gray-900">
                    Venue
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="venue"
                        id="venue"
                        defaultValue={match?.venue || ""}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isKnockout"
                    name="isKnockout"
                    defaultChecked={match?.isKnockout || false}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="isKnockout" className="text-sm font-medium leading-6 text-gray-900">
                    Knockout Round (Enable Penalty Predictions)
                </label>
            </div>

            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
                <SubmitButton />
            </div>
        </form >
    );
}
