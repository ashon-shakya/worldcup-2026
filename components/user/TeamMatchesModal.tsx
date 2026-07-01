"use client";

import { useEffect, useState } from "react";
import { X, Calendar, MapPin, Loader2 } from "lucide-react";
import { getTeamMatches } from "@/app/actions/predictions";
import LocalTime from "@/components/ui/LocalTime";

interface TeamMatchesModalProps {
    teamId: string;
    teamName: string;
    onClose: () => void;
}

export default function TeamMatchesModal({ teamId, teamName, onClose }: TeamMatchesModalProps) {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeamMatches = async () => {
            setLoading(true);
            try {
                const data = await getTeamMatches(teamId);
                setMatches(data);
            } catch (error) {
                console.error("Failed to load team matches:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamMatches();
    }, [teamId]);

    // Close on ESC keypress
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            {/* Modal Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg md:max-w-[620px] max-h-[85vh] flex flex-col shadow-2xl border border-gray-150 dark:border-slate-800 text-gray-900 dark:text-gray-100 overflow-hidden transform scale-95 animate-scale-up">

                {/* Header */}
                <div className="px-6 md:px-7 py-4 md:py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg md:text-[22px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{teamName}</span>
                            <span className="text-xs md:text-[14px] font-semibold text-gray-500 dark:text-gray-400 normal-case">• Match History</span>
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-855 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X size={18} className="md:w-[22px] md:h-[22px]" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-5">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-medium">Loading match history...</span>
                        </div>
                    ) : matches.length === 0 ? (
                        <p className="text-center py-20 text-sm text-gray-500 dark:text-gray-400">
                            No matches found for this team.
                        </p>
                    ) : (
                        <div className="overflow-hidden border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xs">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-left">
                                <thead className="bg-gray-50 dark:bg-slate-950/40 text-xs md:text-[14px] font-semibold text-gray-550 dark:text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th scope="col" className="px-4 md:px-5 py-3 md:py-3.5 text-center w-[65%]">Matchup</th>
                                        <th scope="col" className="px-4 md:px-5 py-3 md:py-3.5 text-center w-[35%]">Score / Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900/40 divide-y divide-gray-150 dark:divide-slate-850">
                                    {matches.map((match) => {
                                        const isFinished = match.status === "FINISHED";
                                        const isLive = match.status === "LIVE";
                                        const isWinner = match.winner === teamId;

                                        // Highlight team name if winner, or style as muted if loser
                                        const getTeamNameStyle = (teamObjId: string) => {
                                            if (!isFinished) return "text-gray-800 dark:text-gray-200 font-semibold";
                                            if (match.winner === teamObjId) {
                                                return "text-yellow-755 dark:text-yellow-500 font-black";
                                            }
                                            return "text-gray-450 dark:text-gray-500 font-medium opacity-65";
                                        };

                                        return (
                                            <tr
                                                key={match._id}
                                                className={`hover:bg-gray-55/50 dark:hover:bg-slate-800/30 transition-colors text-xs md:text-sm ${isFinished && isWinner
                                                    ? "bg-yellow-50/10"
                                                    : ""
                                                    }`}
                                            >
                                                {/* Matchup with metadata underneath */}
                                                <td className="px-2 md:px-3 py-4.5 md:py-5.5">
                                                    <div className="flex flex-col items-center">
                                                        {/* Teams flags & names row */}
                                                        <div className="flex items-center justify-center space-x-3 md:space-x-4 w-full">
                                                            {/* Home Team */}
                                                            <div className="flex flex-col items-center justify-center w-[42%] space-y-1 min-w-0">
                                                                {match.homeTeam.flagUrl && (
                                                                    <img
                                                                        src={match.homeTeam.flagUrl}
                                                                        alt=""
                                                                        className="w-[29px] md:w-[34px] h-[19px] md:h-6 object-cover rounded shadow-3xs border border-gray-100 dark:border-slate-800 shrink-0"
                                                                    />
                                                                )}
                                                                <span className={`truncate text-xs md:text-sm text-center w-full ${getTeamNameStyle(match.homeTeam._id)}`}>
                                                                    {match.homeTeam.name}
                                                                </span>
                                                            </div>

                                                            {/* VS separator */}
                                                            <span className="text-gray-400 dark:text-gray-600 font-bold text-[10px] md:text-xs shrink-0 self-center">vs</span>

                                                            {/* Away Team */}
                                                            <div className="flex flex-col items-center justify-center w-[42%] space-y-1 min-w-0">
                                                                {match.awayTeam.flagUrl && (
                                                                    <img
                                                                        src={match.awayTeam.flagUrl}
                                                                        alt=""
                                                                        className="w-[29px] md:w-[34px] h-[19px] md:h-6 object-cover rounded shadow-3xs border border-gray-100 dark:border-slate-800 shrink-0"
                                                                    />
                                                                )}
                                                                <span className={`truncate text-xs md:text-sm text-center w-full ${getTeamNameStyle(match.awayTeam._id)}`}>
                                                                    {match.awayTeam.name}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Metadata row under the teams */}
                                                        <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-2 md:mt-2.5 text-[9px] md:text-[11px] font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider flex-wrap">
                                                            <span>{match.stage}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-0.5">
                                                                <Calendar size={9} className="opacity-70 md:w-[11px] md:h-[11px]" />
                                                                <LocalTime date={match.kickOff} />
                                                            </span>
                                                            {match.venue && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-0.5 normal-case italic">
                                                                        <MapPin size={9} className="opacity-70 md:w-[11px] md:h-[11px]" />
                                                                        {match.venue}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Score or Status */}
                                                <td className="px-2 md:px-3 py-4.5 md:py-5.5 whitespace-nowrap text-center font-mono align-middle">
                                                    {isFinished ? (
                                                        <span className="inline-flex items-center bg-indigo-50 dark:bg-indigo-950/45 border border-indigo-100 dark:border-indigo-900/30 px-2.5 md:px-3 py-0.5 md:py-1 rounded-md text-xs md:text-sm font-black text-indigo-750 dark:text-indigo-400 shadow-3xs">
                                                            {match.homeScore} - {match.awayScore}
                                                        </span>
                                                    ) : isLive ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="inline-flex items-center bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 px-2.5 md:px-3 py-0.5 md:py-1 rounded-md text-xs md:text-sm font-black text-red-650 dark:text-red-400 shadow-3xs">
                                                                {match.homeScore ?? 0} - {match.awayScore ?? 0}
                                                            </span>
                                                            <span className="text-[8px] md:text-[10px] bg-red-650 text-white px-1.5 md:px-2 rounded animate-pulse uppercase tracking-wider mt-0.5 md:mt-1 font-bold">
                                                                Live
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center bg-gray-50 dark:bg-slate-950/20 text-gray-400 dark:text-gray-500 border border-gray-200/50 dark:border-slate-800 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md text-[9px] md:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                                                            Scheduled
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
