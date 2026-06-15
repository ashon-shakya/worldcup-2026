"use client";

import { useState } from "react";
import { Trophy, Medal, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserPredictionsDropdown from "./UserPredictionsDropdown";

interface LeaderboardRowProps {
    user: any;
    index: number;
    currentUserId?: string;
}

export default function LeaderboardRow({ user, index, currentUserId }: LeaderboardRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getRankIcon = (idx: number) => {
        if (idx === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (idx === 1) return <Medal className="w-6 h-6 text-gray-400" />;
        if (idx === 2) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="font-bold text-gray-500 w-6 text-center">{idx + 1}</span>;
    };

    const getRankClass = (idx: number) => {
        if (idx === 0) return "bg-yellow-50/70 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50 hover:bg-yellow-100/50 dark:hover:bg-yellow-950/30";
        if (idx === 1) return "bg-gray-50/70 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800 hover:bg-gray-100/50 dark:hover:bg-slate-800/60";
        if (idx === 2) return "bg-amber-50/70 dark:bg-amber-950/20 border-orange-200 dark:border-orange-900/40 hover:bg-amber-100/50 dark:hover:bg-amber-950/30";
        return "bg-white dark:bg-slate-900/60 border-gray-100 dark:border-slate-800 hover:bg-gray-50/80 dark:hover:bg-slate-800/40";
    };

    return (
        <div
            id={`leaderboard-row-${user._id}`}
            className={`border rounded-2xl overflow-hidden transition-all duration-200 ${getRankClass(index)} ${user._id === currentUserId ? "ring-2 ring-indigo-500 z-10 relative" : "shadow-xs hover:shadow-sm"}`}
        >
            {/* Header: Clickable user row */}
            <div
                id={`leaderboard-header-${user._id}`}
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center p-4 cursor-pointer select-none"
            >
                <div className="flex-shrink-0 w-12 flex justify-center">
                    {getRankIcon(index)}
                </div>
                <div className="flex-shrink-0 ml-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 overflow-hidden">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            user.name.charAt(0).toUpperCase()
                        )}
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                        {user.name}
                        {user._id === currentUserId && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">You</span>
                        )}
                    </div>
                    <div className="text-xs text-gray-500">
                        Joined {new Date().getFullYear()}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right px-2 sm:px-4">
                        <span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-400">{user.totalPoints}</span>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">Points</span>
                    </div>
                    <ChevronDown
                        id={`chevron-${user._id}`}
                        className={`w-5 h-5 text-gray-400 transition-transform duration-250 shrink-0 mr-1 ${isExpanded ? "rotate-180 text-indigo-600" : ""}`}
                    />
                </div>
            </div>

            {/* Collapsible Predictions Panel */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <UserPredictionsDropdown userId={user._id} isExpanded={isExpanded} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
