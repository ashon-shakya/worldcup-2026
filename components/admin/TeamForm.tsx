"use client";

import { createTeam, updateTeam } from "@/app/actions/admin/teams";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
// import { toast } from "sonner"; // Assuming sonner is installed or will be used for toasts

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
            {pending ? "Saving..." : "Save"}
        </button>
    );
}

export default function TeamForm({ onClose, team }: { onClose?: () => void; team?: any }) {
    const actionToUse = team ? updateTeam.bind(null, team._id) : createTeam;
    const [state, dispatch] = useActionState(actionToUse, null);

    useEffect(() => {
        if (state?.message === "success") {
            // toast.success("Team created successfully");
            if (onClose) onClose();
        }
    }, [state, onClose]);

    return (
        <form action={dispatch} className="space-y-4" encType="multipart/form-data">
            <div>
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                    Team Name
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        defaultValue={team?.name}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                    />
                </div>
                {state?.errors?.name && <p className="text-red-500 text-sm">{state.errors.name[0]}</p>}
            </div>

            <div>
                <label htmlFor="shortName" className="block text-sm font-medium leading-6 text-gray-900">
                    Short Name (2-Letter Country Code)
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="shortName"
                        id="shortName"
                        maxLength={2}
                        placeholder="e.g. US, BR, FR"
                        defaultValue={team?.shortName}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2 uppercase"
                    />
                </div>
                {state?.errors?.shortName && <p className="text-red-500 text-sm">{state.errors.shortName[0]}</p>}
                <p className="mt-1 text-xs text-gray-500">Used to auto-generate flag.</p>
            </div>

            <div>
                <label htmlFor="flagUrl" className="block text-sm font-medium leading-6 text-gray-900">
                    Flag URL
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="flagUrl"
                        id="flagUrl"
                        defaultValue={team?.flagUrl}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                    />
                </div>
                {state?.errors?.flagUrl && <p className="text-red-500 text-sm">{state.errors.flagUrl[0]}</p>}
            </div>

            <div>
                <label htmlFor="championImageUrl" className="block text-sm font-medium leading-6 text-gray-900 font-semibold text-gray-800">
                    Champion Hero Image URL / Path
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="championImageUrl"
                        id="championImageUrl"
                        placeholder="e.g. /dummy-champion.png"
                        defaultValue={team?.championImageUrl}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                    />
                </div>
                {state?.errors?.championImageUrl && <p className="text-red-500 text-sm">{state.errors.championImageUrl[0]}</p>}
            </div>

            <div>
                <label htmlFor="championImageFile" className="block text-sm font-medium leading-6 text-gray-900 font-semibold text-gray-800">
                    Or Upload Champion Image
                </label>
                <div className="mt-2">
                    <input
                        type="file"
                        name="championImageFile"
                        id="championImageFile"
                        accept="image/*"
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500">Will upload to folder "worldcup-2026/champions" with the team name as filename.</p>
            </div>

            {team?.championImageUrl && (
                <div className="flex items-center gap-3 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">
                    <img src={team.championImageUrl} alt="Current Champion" className="w-12 h-16 object-cover rounded shadow-sm" />
                    <div>
                        <p className="text-xs font-bold text-indigo-900">Current Champion Image</p>
                        <p className="text-[10px] text-indigo-700 truncate max-w-[250px]">{team.championImageUrl}</p>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="group" className="block text-sm font-medium leading-6 text-gray-900">
                    Group (A-H)
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="group"
                        id="group"
                        maxLength={1}
                        defaultValue={team?.group}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2 uppercase"
                    />
                </div>
                {state?.errors?.group && <p className="text-red-500 text-sm">{state.errors.group[0]}</p>}
            </div>

            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
                <SubmitButton />
            </div>
        </form>
    );
}
