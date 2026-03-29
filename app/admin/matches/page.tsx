"use client";
import { getMatches, deleteMatch, deleteMatches } from "@/app/actions/admin/matches";
import MatchForm from "@/components/admin/MatchForm";
import { Plus, Trash2, Upload, Calendar, MapPin, ArrowUp, ArrowDown, ArrowUpDown, Search, X, Edit } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";

import ScoreModal from "@/components/admin/ScoreModal";

type SortKey = "kickOff" | "stage" | "status";
type SortDir = "asc" | "desc";

const STAGES = ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "Final"];
const STATUSES = ["SCHEDULED", "LIVE", "FINISHED"];

export default function MatchesPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scoreModalMatch, setScoreModalMatch] = useState<any>(null);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sort state
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStage, setFilterStage] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const fetchMatches = async () => {
        setIsLoading(true);
        const data = await getMatches();
        setMatches(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchMatches();
    }, [isModalOpen, scoreModalMatch]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure?")) {
            await deleteMatch(id);
            setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
            fetchMatches();
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} selected match(es) and their predictions?`)) return;
        await deleteMatches(Array.from(selectedIds));
        setSelectedIds(new Set());
        fetchMatches();
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === displayedMatches.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayedMatches.map((m) => m._id)));
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

        const promise = fetch("/api/admin/matches/import", {
            method: "POST",
            body: formData,
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Import failed");
            return data;
        });

        toast.promise(promise, {
            loading: "Importing matches...",
            success: (data) => {
                fetchMatches();
                if (fileInputRef.current) fileInputRef.current.value = "";
                return `Successfully imported ${data.importedCount} matches`;
            },
            error: (err) => {
                return err.message;
            }
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString();
    };

    // Sort handler
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            if (sortDir === "asc") setSortDir("desc");
            else { setSortKey(null); setSortDir("asc"); }
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return <ArrowUpDown size={14} className="ml-1 inline opacity-40" />;
        return sortDir === "asc"
            ? <ArrowUp size={14} className="ml-1 inline" />
            : <ArrowDown size={14} className="ml-1 inline" />;
    };

    const hasActiveFilters = searchQuery || filterStage || filterStatus;

    const clearFilters = () => {
        setSearchQuery("");
        setFilterStage("");
        setFilterStatus("");
    };

    // Filter + sort pipeline
    const displayedMatches = useMemo(() => {
        let filtered = matches;

        // Search by team name
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (m) =>
                    (m.homeTeam?.name || "").toLowerCase().includes(q) ||
                    (m.awayTeam?.name || "").toLowerCase().includes(q)
            );
        }

        // Filter by stage
        if (filterStage) {
            filtered = filtered.filter((m) => m.stage === filterStage);
        }

        // Filter by status
        if (filterStatus) {
            filtered = filtered.filter((m) => m.status === filterStatus);
        }

        // Sort
        if (sortKey) {
            filtered = [...filtered].sort((a, b) => {
                let aVal: any, bVal: any;
                if (sortKey === "kickOff") {
                    aVal = new Date(a.kickOff).getTime();
                    bVal = new Date(b.kickOff).getTime();
                } else if (sortKey === "stage") {
                    aVal = STAGES.indexOf(a.stage);
                    bVal = STAGES.indexOf(b.stage);
                    if (aVal === -1) aVal = 999;
                    if (bVal === -1) bVal = 999;
                } else {
                    aVal = (a[sortKey] || "").toLowerCase();
                    bVal = (b[sortKey] || "").toLowerCase();
                }
                if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
                if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [matches, searchQuery, filterStage, filterStatus, sortKey, sortDir]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
                </div>

                <div className="flex gap-2">
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
                            setSelectedMatch(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500"
                    >
                        <Plus size={20} />
                        Add Match
                    </button>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by team name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                    />
                </div>
                <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                >
                    <option value="">All Stages</option>
                    {STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                >
                    <option value="">All Statuses</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                    >
                        <X size={14} />
                        Clear filters
                    </button>
                )}
                <span className="text-sm text-gray-500 ml-auto">
                    {displayedMatches.length} of {matches.length} matches
                </span>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">{selectedMatch ? "Edit Match" : "Add New Match"}</h2>
                        <MatchForm key={selectedMatch?._id || "new"} match={selectedMatch} onClose={() => { setIsModalOpen(false); setSelectedMatch(null); }} />
                    </div>
                </div>
            )}

            {scoreModalMatch && (
                <ScoreModal match={scoreModalMatch} onClose={() => setScoreModalMatch(null)} />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 w-10">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                    checked={displayedMatches.length > 0 && selectedIds.size === displayedMatches.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matchup</th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                                onClick={() => handleSort("kickOff")}
                            >
                                Date & Venue <SortIcon column="kickOff" />
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                                onClick={() => handleSort("stage")}
                            >
                                Stage <SortIcon column="stage" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                                onClick={() => handleSort("status")}
                            >
                                Status <SortIcon column="status" />
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={7} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : displayedMatches.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">{hasActiveFilters ? "No matches match your filters." : "No matches scheduled."}</td></tr>
                        ) : (
                            displayedMatches.map((match) => (
                                <tr key={match._id} className={selectedIds.has(match._id) ? "bg-indigo-50" : ""}>
                                    <td className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                            checked={selectedIds.has(match._id)}
                                            onChange={() => toggleSelect(match._id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-end w-1/2 space-x-2">
                                                <span className="font-medium text-gray-900">{match.homeTeam?.name || "Unknown"}</span>
                                                {match.homeTeam?.flagUrl && (
                                                    <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="w-6 h-4 object-cover rounded shadow-sm" />
                                                )}
                                            </div>
                                            <span className="text-gray-400">vs</span>
                                            <div className="flex items-center justify-start w-1/2 space-x-2">
                                                {match.awayTeam?.flagUrl && (
                                                    <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="w-6 h-4 object-cover rounded shadow-sm" />
                                                )}
                                                <span className="font-medium text-gray-900">{match.awayTeam?.name || "Unknown"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {formatDate(match.kickOff)}
                                            </div>
                                            {match.venue && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <MapPin size={14} />
                                                    {match.venue}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${match.stage === "Group Stage" ? "bg-gray-50 text-gray-600 ring-gray-500/10" :
                                            match.stage === "Round of 32" ? "bg-blue-50 text-green-700 ring-green-700/10" :
                                                match.stage === "Round of 16" ? "bg-blue-50 text-blue-700 ring-blue-700/10" :
                                                    match.stage === "Quarter Final" ? "bg-amber-50 text-amber-700 ring-amber-700/10" :
                                                        match.stage === "Semi Final" ? "bg-purple-50 text-purple-700 ring-purple-700/10" :
                                                            match.stage === "Final" ? "bg-rose-50 text-rose-700 ring-rose-700/10" :
                                                                "bg-indigo-50 text-indigo-700 ring-indigo-700/10"
                                            }`}>
                                            {match.stage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium">
                                        <button
                                            onClick={() => setScoreModalMatch(match)}
                                            className="transition-colors focus:outline-none"
                                        >
                                            {match.homeScore !== null && match.awayScore !== null ? (
                                                <span className="text-gray-900 font-bold text-lg hover:text-indigo-600 px-2 py-1 rounded hover:bg-gray-50">{`${match.homeScore} - ${match.awayScore} `}</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 hover:bg-indigo-100 hover:ring-indigo-700/20">
                                                    Set Score
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${match.status === "LIVE" ? "bg-green-50 text-green-700 ring-green-600/20" :
                                            match.status === "FINISHED" ? "bg-blue-50 text-blue-700 ring-blue-700/10" :
                                                "bg-gray-50 text-gray-600 ring-gray-500/10"
                                            }`}>
                                            {match.status === "LIVE" && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />}
                                            {match.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedMatch(match);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            title="Edit Match"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(match._id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete Match"
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
