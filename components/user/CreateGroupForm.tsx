"use client";

import { createGroup } from "@/app/actions/groups";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
            {pending ? "Creating..." : "Create Group"}
        </button>
    );
}

export default function CreateGroupForm({ onClose }: { onClose: () => void }) {
    const [state, dispatch] = useActionState(createGroup, null);
    const router = useRouter();

    useEffect(() => {
        if (state?.message === "success" && state.groupId) {
            router.push(`/dashboard/groups/${state.groupId}`);
            onClose(); // Optional, but good if modal
        }
    }, [state, router, onClose]);

    return (
        <form action={dispatch} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Group Name
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="e.g. Office League"
                />
            </div>

            {state?.message && state.message !== "success" && (
                <div className="text-red-500 text-sm">{state.message}</div>
            )}

            <SubmitButton />
        </form>
    );
}
