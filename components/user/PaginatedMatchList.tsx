"use client";

import { useState, useMemo } from "react";
import MatchCard from "@/components/user/MatchCard";
import { ChevronLeft, ChevronRight, Search, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

const MATCHES_PER_PAGE = 10;
const STAGES = ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "Final"];
const STATUSES = ["SCHEDULED", "LIVE", "FINISHED"];

type SortKey = "kickOff" | "stage";
type SortDir = "asc" | "desc";

interface PaginatedMatchListProps {
    matchesByStage: Record<string, any[]>;
    stagesOrder: string[];
    extraStages: string[];
    userPredictions: Record<string, any>;
}

export default function PaginatedMatchList({
    matchesByStage,
    stagesOrder,
    extraStages,
    userPredictions,
}: PaginatedMatchListProps) {
    const [currentPage, setCurrentPage] = useState(1);

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStage, setFilterStage] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Sort state
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    // Flatten all matches
    const allStages = [...stagesOrder, ...extraStages];
    const allMatches = useMemo(() => {
        const flat: { stage: string; match: any }[] = [];
        allStages.forEach((stage) => {
            const stageMatches = matchesByStage[stage]?.sort(
                (a, b) => new Date(a.kickOff).getTime() - new Date(b.kickOff).getTime()
            );
            if (stageMatches) {
                stageMatches.forEach((match) => flat.push({ stage, match }));
            }
        });
        return flat;
    }, [matchesByStage, stagesOrder, extraStages]);

    // Filter + sort pipeline
    const filteredMatches = useMemo(() => {
        let result = allMatches;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                ({ match }) =>
                    (match.homeTeam?.name || "").toLowerCase().includes(q) ||
                    (match.awayTeam?.name || "").toLowerCase().includes(q)
            );
        }

        if (filterStage) {
            result = result.filter(({ stage }) => stage === filterStage);
        }

        if (filterStatus) {
            result = result.filter(({ match }) => match.status === filterStatus);
        }

        if (sortKey) {
            result = [...result].sort((a, b) => {
                let aVal: any, bVal: any;
                if (sortKey === "kickOff") {
                    aVal = new Date(a.match.kickOff).getTime();
                    bVal = new Date(b.match.kickOff).getTime();
                } else if (sortKey === "stage") {
                    aVal = STAGES.indexOf(a.stage);
                    bVal = STAGES.indexOf(b.stage);
                    if (aVal === -1) aVal = 999;
                    if (bVal === -1) bVal = 999;
                }
                if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
                if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [allMatches, searchQuery, filterStage, filterStatus, sortKey, sortDir]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredMatches.length / MATCHES_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const startIdx = (safeCurrentPage - 1) * MATCHES_PER_PAGE;
    const endIdx = startIdx + MATCHES_PER_PAGE;
    const pageMatches = filteredMatches.slice(startIdx, endIdx);

    // Re-group the current page's matches by stage
    const groupedPage: Record<string, any[]> = {};
    pageMatches.forEach(({ stage, match }) => {
        if (!groupedPage[stage]) groupedPage[stage] = [];
        groupedPage[stage].push(match);
    });
    const pageStages = allStages.filter((s) => groupedPage[s]);

    const hasActiveFilters = searchQuery || filterStage || filterStatus;

    const clearFilters = () => {
        setSearchQuery("");
        setFilterStage("");
        setFilterStatus("");
        setCurrentPage(1);
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            if (sortDir === "asc") setSortDir("desc");
            else { setSortKey(null); setSortDir("asc"); }
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
        setCurrentPage(1);
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (safeCurrentPage > 3) pages.push("...");
            for (let i = Math.max(2, safeCurrentPage - 1); i <= Math.min(totalPages - 1, safeCurrentPage + 1); i++) {
                pages.push(i);
            }
            if (safeCurrentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    // Reset to page 1 when filters change
    const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
        setter(value);
        setCurrentPage(1);
    };

    const SortButton = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
        <button
            onClick={() => handleSort(sortKeyVal)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                sortKey === sortKeyVal
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
        >
            {label}
            {sortKey !== sortKeyVal ? (
                <ArrowUpDown size={14} className="opacity-40" />
            ) : sortDir === "asc" ? (
                <ArrowUp size={14} />
            ) : (
                <ArrowDown size={14} />
            )}
        </button>
    );

    return (
        <div>
            {/* Filter & sort bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by team name..."
                        value={searchQuery}
                        onChange={(e) => handleFilterChange(setSearchQuery)(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                    />
                </div>
                <select
                    value={filterStage}
                    onChange={(e) => handleFilterChange(setFilterStage)(e.target.value)}
                    className="rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                >
                    <option value="">All Stages</option>
                    {STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(setFilterStatus)(e.target.value)}
                    className="rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                >
                    <option value="">All Statuses</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                    <span className="text-xs text-gray-500 uppercase font-medium">Sort:</span>
                    <SortButton label="Date" sortKeyVal="kickOff" />
                    <SortButton label="Stage" sortKeyVal="stage" />
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                    >
                        <X size={14} />
                        Clear filters
                    </button>
                )}
            </div>

            {/* Match count */}
            <div className="text-sm text-gray-500 mb-4">
                {filteredMatches.length} of {allMatches.length} matches
            </div>

            {/* Matches */}
            {filteredMatches.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                    {hasActiveFilters ? "No matches match your filters." : "No matches scheduled yet."}
                </p>
            ) : (
                <>
                    {pageStages.map((stage) => (
                        <div key={stage} className="mb-10">
                            <div className="flex items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">{stage}</h2>
                                <div className="ml-4 flex-1 h-px bg-gray-200"></div>
                            </div>
                            <div className="space-y-4">
                                {groupedPage[stage].map((match: any) => (
                                    <MatchCard
                                        key={match._id}
                                        match={match}
                                        prediction={userPredictions[match._id]}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-6">
                            <div className="text-sm text-gray-500">
                                Showing {startIdx + 1}–{Math.min(endIdx, filteredMatches.length)} of {filteredMatches.length} matches
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => goToPage(safeCurrentPage - 1)}
                                    disabled={safeCurrentPage === 1}
                                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {getPageNumbers().map((page, i) =>
                                    page === "..." ? (
                                        <span key={`dots-${i}`} className="px-2 py-1 text-sm text-gray-400">…</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page as number)}
                                            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                                                safeCurrentPage === page
                                                    ? "bg-indigo-600 text-white"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() => goToPage(safeCurrentPage + 1)}
                                    disabled={safeCurrentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
