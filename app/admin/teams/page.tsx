"use client";

import { getTeams, deleteTeam, deleteTeams } from "@/app/actions/admin/teams";
import TeamForm from "@/components/admin/TeamForm";
import { Plus, Trash2, Upload, Edit, ArrowUp, ArrowDown, ArrowUpDown, Search, X } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { getStoredFilters, setStoredFilters } from "@/lib/filterStorage";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Pagination from "@/components/admin/Pagination";

type SortKey = "name" | "group";
type SortDir = "asc" | "desc";
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
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const pageParam = searchParams.get("page");
    const currentPage = pageParam ? Number(pageParam) : 1;

    const [isInitialized, setIsInitialized] = useState(false);

    // Seek stored filters on mount
    useEffect(() => {
        const stored = getStoredFilters("/admin/teams", {
            sortKey: null,
            sortDir: "asc",
            searchQuery: ""
        });
        setSortKey(stored.sortKey);
        setSortDir(stored.sortDir);
        setSearchQuery(stored.searchQuery);
        setIsInitialized(true);
    }, []);

    // Sync state changes with localStorage
    useEffect(() => {
        if (isInitialized) {
            setStoredFilters("/admin/teams", {
                sortKey,
                sortDir,
                searchQuery
            });
        }
    }, [sortKey, sortDir, searchQuery, isInitialized]);

    // Reset page to 1 when search changes
    useEffect(() => {
        if (isInitialized) {
            const params = new URLSearchParams(searchParams);
            params.set("page", "1");
            replace(`${pathname}?${params.toString()}`);
        }
    }, [searchQuery]);

    const filteredTeams = useMemo(() => {
        if (!searchQuery) return teams;
        const q = searchQuery.toLowerCase();
        return teams.filter((t) => (t.name || "").toLowerCase().includes(q));
    }, [teams, searchQuery]);

    const sortedTeams = useMemo(() => {
        if (!sortKey) return filteredTeams;
        return [...filteredTeams].sort((a, b) => {
            const aVal = (a[sortKey] || "").toLowerCase();
            const bVal = (b[sortKey] || "").toLowerCase();
            if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredTeams, sortKey, sortDir]);

    const TEAMS_PER_PAGE = 10;
    const totalPages = Math.max(1, Math.ceil(sortedTeams.length / TEAMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIdx = (safeCurrentPage - 1) * TEAMS_PER_PAGE;
    const paginatedTeams = useMemo(() => {
        return sortedTeams.slice(startIdx, startIdx + TEAMS_PER_PAGE);
    }, [sortedTeams, startIdx]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            if (sortDir === "asc") setSortDir("desc");
            else { setSortKey(null); setSortDir("asc"); }
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
        
        // Reset to page 1
        const params = new URLSearchParams(searchParams);
        params.set("page", "1");
        replace(`${pathname}?${params.toString()}`);
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return <ArrowUpDown size={14} className="ml-1 inline opacity-40" />;
        return sortDir === "asc"
            ? <ArrowUp size={14} className="ml-1 inline" />
            : <ArrowDown size={14} className="ml-1 inline" />;
    };

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
            setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
            fetchTeams();
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} selected team(s)?`)) return;
        await deleteTeams(Array.from(selectedIds));
        setSelectedIds(new Set());
        fetchTeams();
    };

    const toggleSelectAll = () => {
        const allOnPageSelected = paginatedTeams.length > 0 && paginatedTeams.every((t) => selectedIds.has(t._id));
        if (allOnPageSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                paginatedTeams.forEach((t) => next.delete(t._id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                paginatedTeams.forEach((t) => next.add(t._id));
                return next;
            });
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
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
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500"
                        >
                            <Trash2 size={20} />
                            Delete Selected ({selectedIds.size})
                        </button>
                    )}
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
                        onClick={() => {
                            setSelectedTeam(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500"
                    >
                        <Plus size={20} />
                        Add Team
                    </button>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                    />
                </div>
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                    >
                        <X size={14} />
                        Clear search
                    </button>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">{selectedTeam ? "Edit Team" : "Add New Team"}</h2>
                        <TeamForm key={selectedTeam?._id || "new"} team={selectedTeam} onClose={() => { setIsModalOpen(false); setSelectedTeam(null); }} />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 w-10">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                    checked={paginatedTeams.length > 0 && paginatedTeams.every((t) => selectedIds.has(t._id))}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort("name")}>
                                Team <SortIcon column="name" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort("group")}>
                                Group <SortIcon column="group" />
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : teams.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No teams found.</td></tr>
                        ) : (
                            paginatedTeams.map((team) => (
                                <tr key={team._id} className={selectedIds.has(team._id) ? "bg-indigo-50" : ""}>
                                    <td className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                            checked={selectedIds.has(team._id)}
                                            onChange={() => toggleSelect(team._id)}
                                        />
                                    </td>
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
                                            onClick={() => {
                                                setSelectedTeam(team);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            title="Edit Team"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(team._id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete Team"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <Pagination totalPages={totalPages} currentPage={safeCurrentPage} />
            </div>
        </div>
    );
}
