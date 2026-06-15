"use client";

import { useState } from "react";
import { Trophy, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserPredictionsDropdown from "./UserPredictionsDropdown";

interface GroupMemberRowProps {
    user: any;
    index: number;
    currentUserId?: string;
    allowedStages?: string[];
}

export default function GroupMemberRow({ user, index, currentUserId, allowedStages }: GroupMemberRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getRankIcon = (idx: number) => {
        if (idx === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (idx === 1) return <span className="text-gray-400 font-bold text-lg">2</span>;
        if (idx === 2) return <span className="text-amber-600 font-bold text-lg">3</span>;
        return <span className="text-gray-500 font-bold">{idx + 1}</span>;
    };

    return (
        <div
            id={`group-member-row-${user._id}`}
            className={`border-b border-gray-100 dark:border-slate-800 last:border-b-0 overflow-hidden transition-all duration-200 ${user._id === currentUserId ? "bg-indigo-50/30 dark:bg-indigo-950/20" : "bg-white dark:bg-slate-900/60 hover:bg-gray-50/50 dark:hover:bg-slate-800/50"}`}
        >
            {/* Header: Clickable member details */}
            <div
                id={`group-member-header-${user._id}`}
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center px-6 py-4 cursor-pointer select-none"
            >
                <div className="flex-shrink-0 w-8 flex justify-center text-center">
                    {getRankIcon(index)}
                </div>
                <div className="flex-shrink-0 ml-4">
                    <div className="h-10 w-10 rounded-full bg-gray-250 bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-200 text-gray-500 font-semibold">
                        {user.image ? (
                            <img src={user.image} alt={user.nickname || user.name} className="h-full w-full object-cover" />
                        ) : (
                            (user.nickname || user.name).charAt(0).toUpperCase()
                        )}
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                        {user.nickname || user.name}
                        {user._id === currentUserId && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide">You</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="block text-xl font-bold text-indigo-600 dark:text-indigo-400">{user.totalPoints}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Pts</span>
                    </div>
                    <ChevronDown
                        id={`chevron-${user._id}`}
                        className={`w-5 h-5 text-gray-400 transition-transform duration-250 shrink-0 ${isExpanded ? "rotate-180 text-indigo-600" : ""}`}
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
                        <UserPredictionsDropdown userId={user._id} isExpanded={isExpanded} allowedStages={allowedStages} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
