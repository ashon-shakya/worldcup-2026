"use client";

import { getMatches, deleteMatch } from "@/app/actions/admin/matches";
import MatchForm from "@/components/admin/MatchForm";
import { Plus, Trash2, Calendar, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

import ScoreModal from "@/components/admin/ScoreModal";

export default function MatchesPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scoreModalMatch, setScoreModalMatch] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMatches = async () => {
        setIsLoading(true);
        const data = await getMatches();
        setMatches(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (!isModalOpen && !scoreModalMatch) {
            fetchMatches();
        }
    }, [isModalOpen, scoreModalMatch]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure?")) {
            await deleteMatch(id);
            fetchMatches();
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500"
                >
                    <Plus size={20} />
                    Add Match
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">Add New Match</h2>
                        <MatchForm onClose={() => setIsModalOpen(false)} />
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matchup</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Venue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : matches.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No matches scheduled.</td></tr>
                        ) : (
                            matches.map((match) => (
                                <tr key={match._id}>
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
                                                <span className="text-gray-900 font-bold text-lg hover:text-indigo-600 px-2 py-1 rounded hover:bg-gray-50">{`${match.homeScore} - ${match.awayScore}`}</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 hover:bg-indigo-100 hover:ring-indigo-700/20">
                                                    Set Score
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(match._id)}
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
