"use client";

import { getTeams, deleteTeam } from "@/app/actions/admin/teams";
import TeamForm from "@/components/admin/TeamForm";
import { Plus, Trash2, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

// Allow passing initial teams from server component if needed, but for now we fetch in client or passed as prop. 
// Actually better to make this a Server Component that passes data to a Client List.
// Let's refactor: Page is Server Component, List is Client Component.

export default function TeamsPage() {
    // This is a Client Component wrapper or we make the page server component? 
    // Let's make the page a Client Component for simplicity of state management (Modal), 
    // fetching data via useEffect or we can make the parent Page async.
    // Making it async Server Component is better for SEO/Perf.

    // Changing approach: This file will be Client Component for this iteration to handle the Modal state easily, 
    // and we will fetch data in a useEffect or use a separate Server Component for the list.
    // To stick to Next.js patterns: Page (Server) -> ClientList.
    // But for speed: Client Page.

    // Wait, I cannot export async default from client component.
    // I will write this file as a Client Component that fetches on mount (SWR style or simple useEffect).

    const [teams, setTeams] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchTeams = async () => {
        setIsLoading(true);
        const data = await getTeams();
        setTeams(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTeams();
    }, [isModalOpen]); // Refetch when modal closes (created team)

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure?")) {
            await deleteTeam(id);
            fetchTeams();
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const promise = fetch("/api/admin/teams/import", {
            method: "POST",
            body: formData,
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Import failed");
            return data;
        });

        toast.promise(promise, {
            loading: "Importing teams...",
            success: (data) => {
                fetchTeams();
                // Clear the input so same file can be selected again if needed
                if (fileInputRef.current) fileInputRef.current.value = "";
                return `Successfully imported ${data.importedCount} teams`;
            },
            error: (err) => {
                return err.message;
            }
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={handleImportClick}
                        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        <Upload size={20} />
                        Import CSV
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500"
                    >
                        <Plus size={20} />
                        Add Team
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Add New Team</h2>
                        <TeamForm onClose={() => setIsModalOpen(false)} />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={3} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : teams.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No teams found.</td></tr>
                        ) : (
                            teams.map((team) => (
                                <tr key={team._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {team.flagUrl && <img className="h-6 w-8 mr-3 object-cover rounded" src={team.flagUrl} alt="" />}
                                            <div className="text-sm font-medium text-gray-900">{team.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                            {team.group || "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(team._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
