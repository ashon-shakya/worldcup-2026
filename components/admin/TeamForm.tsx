"use client";

import { createTeam } from "@/app/actions/admin/teams";
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

export default function TeamForm({ onClose }: { onClose?: () => void }) {
    const [state, dispatch] = useActionState(createTeam, null);

    useEffect(() => {
        if (state?.message === "success") {
            // toast.success("Team created successfully");
            if (onClose) onClose();
        }
    }, [state, onClose]);

    return (
        <form action={dispatch} className="space-y-4">
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
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                    />
                </div>
                {state?.errors?.flagUrl && <p className="text-red-500 text-sm">{state.errors.flagUrl[0]}</p>}
            </div>

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
