"use client";

import { deleteUser, updateUserRole } from "@/app/actions/admin/users";
import { useTransition } from "react";

export default function UserRow({ user }: { user: any }) {
    const [isPending, startTransition] = useTransition();

    const handleRoleChange = (newRole: "USER" | "ADMIN") => {
        if (confirm(`Are you sure you want to change ${user.name}'s role to ${newRole}?`)) {
            startTransition(async () => {
                await updateUserRole(user._id, newRole);
            });
        }
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            startTransition(async () => {
                await deleteUser(user._id);
            });
        }
    };

    return (
        <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'ADMIN' ? 'bg-purple-600' : 'bg-indigo-500'}`}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}>
                    {user.role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                <button
                    onClick={() => handleRoleChange(user.role === "ADMIN" ? "USER" : "ADMIN")}
                    disabled={isPending}
                    className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                >
                    {user.role === "ADMIN" ? "Demote" : "Promote"}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 ml-4"
                >
                    Delete
                </button>
            </td>
        </tr>
    );
}
