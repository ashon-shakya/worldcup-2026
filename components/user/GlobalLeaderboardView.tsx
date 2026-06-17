"use client";

import { useState } from "react";
import { ListOrdered, Trophy } from "lucide-react";
import LeaderboardRow from "./LeaderboardRow";
import LeaderboardRace from "./LeaderboardRace";

interface GlobalLeaderboardViewProps {
    leaderboard: any[];
    currentUserId?: string;
}

export default function GlobalLeaderboardView({ leaderboard, currentUserId }: GlobalLeaderboardViewProps) {
    const [activeTab, setActiveTab] = useState<"standings" | "race">("standings");

    return (
        <div className="space-y-6 max-w-4xl mx-auto w-full">
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-xl p-1 shadow-xs border gap-1 max-w-md mx-auto">
                <button
                    onClick={() => setActiveTab("standings")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === "standings"
                            ? "bg-indigo-600 text-white shadow-sm font-bold"
                            : "text-gray-650 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    }`}
                >
                    <ListOrdered size={16} />
                    Standings
                </button>
                <button
                    onClick={() => setActiveTab("race")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === "race"
                            ? "bg-indigo-600 text-white shadow-sm font-bold"
                            : "text-gray-655 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    }`}
                >
                    <Trophy size={16} />
                    Leaderboard Race
                </button>
            </div>

            {/* Standings Tab */}
            {activeTab === "standings" && (
                <div className="space-y-3">
                    {leaderboard.map((user: any, index: number) => (
                        <LeaderboardRow
                            key={user._id}
                            user={user}
                            index={index}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}

            {/* Race Tab */}
            {activeTab === "race" && (
                <div className="w-full">
                    <LeaderboardRace />
                </div>
            )}
        </div>
    );
}
