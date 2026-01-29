"use client";

import { joinGroup } from "@/app/actions/groups";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
            {pending ? "Joining..." : "Join Group"}
        </button>
    );
}

export default function JoinGroupForm({ onClose }: { onClose: () => void }) {
    const [state, dispatch] = useActionState(joinGroup, null);
    const router = useRouter();

    useEffect(() => {
        if (state?.message === "success" && state.groupId) {
            router.push(`/dashboard/groups/${state.groupId}`);
            onClose();
        }
    }, [state, router, onClose]);

    return (
        <form action={dispatch} className="space-y-4">
            <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Group Code
                </label>
                <input
                    type="text"
                    name="code"
                    id="code"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border uppercase"
                    placeholder="e.g. A1B2C3"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Ask your friend for the 6-character group invite code.
                </p>
            </div>

            {state?.message && state.message !== "success" && (
                <div className="text-red-500 text-sm">{state.message}</div>
            )}

            <SubmitButton />
        </form>
    );
}
