"use client";

import { deleteUser, updateUserRole } from "@/app/actions/admin/users";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export default function UserRow({ user }: { user: any }) {
    const [isPending, startTransition] = useTransition();

    const handleRoleChange = (newRole: "USER" | "ADMIN" | "MODERATOR") => {
        if (confirm(`Are you sure you want to change ${user.nickname || user.name}'s role to ${newRole}?`)) {
            startTransition(async () => {
                await updateUserRole(user._id, newRole);
            });
        }
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${user.nickname || user.name}? This action cannot be undone.`)) {
            startTransition(async () => {
                await deleteUser(user._id);
            });
        }
    };

    const getRoleSelectStyles = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-purple-50 border-purple-200 text-purple-800 focus:ring-purple-500 focus:border-purple-500";
            case "MODERATOR":
                return "bg-indigo-50 border-indigo-200 text-indigo-800 focus:ring-indigo-500 focus:border-indigo-500";
            default:
                return "bg-gray-50 border-gray-200 text-gray-800 focus:ring-gray-500 focus:border-gray-500";
        }
    };

    const getAvatarBg = (role: string) => {
        if (role === "ADMIN") return "bg-purple-600";
        if (role === "MODERATOR") return "bg-indigo-600";
        return "bg-gray-400";
    };

    return (
        <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold transition-colors ${getAvatarBg(user.role)}`}>
                            {(user.nickname || user.name).charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {user.nickname ? `${user.nickname} (${user.name})` : user.name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(e.target.value as any)}
                    disabled={isPending}
                    className={`text-xs border rounded-lg p-1.5 cursor-pointer font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${getRoleSelectStyles(user.role)}`}
                >
                    <option value="USER">USER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    title="Delete User"
                    className="p-2 rounded-full text-red-600 hover:bg-red-50 bg-red-100/50 transition-colors disabled:opacity-50 inline-flex items-center"
                >
                    <Trash2 size={18} />
                </button>
            </td>
        </tr>
    );
}
