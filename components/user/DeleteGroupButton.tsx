"use client";

import { deleteGroup } from "@/app/actions/groups";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function DeleteGroupButton({ groupId }: { groupId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this group? This action cannot be undone and will remove all members from the group.")) {
            startTransition(async () => {
                const result = await deleteGroup(groupId);
                if (result.message === "success") {
                    router.push("/dashboard/groups");
                    router.refresh();
                } else {
                    alert(result.message);
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
        >
            <Trash2 size={16} />
            {isPending ? "Deleting..." : "Delete Group"}
        </button>
    );
}
