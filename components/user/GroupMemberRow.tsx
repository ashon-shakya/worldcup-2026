"use client";

import { useState } from "react";
import { Trophy, ChevronDown, UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserPredictionsDropdown from "./UserPredictionsDropdown";
import { removeGroupMember } from "@/app/actions/groups";
import { toast } from "sonner";

interface GroupMemberRowProps {
    user: any;
    index: number;
    currentUserId?: string;
    allowedStages?: string[];
    stageMultipliers?: Record<string, number>;
    groupId: string;
    isPrivate?: boolean;
    isAdmin?: boolean;
}

export default function GroupMemberRow({ 
    user, 
    index, 
    currentUserId, 
    allowedStages,
    stageMultipliers,
    groupId,
    isPrivate = false,
    isAdmin = false
}: GroupMemberRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const getRankIcon = (idx: number) => {
        if (idx === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (idx === 1) return <span className="text-gray-400 font-bold text-lg">2</span>;
        if (idx === 2) return <span className="text-amber-600 font-bold text-lg">3</span>;
        return <span className="text-gray-500 font-bold">{idx + 1}</span>;
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowConfirm(true);
    };

    const confirmRemove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRemoving(true);
        try {
            const res = await removeGroupMember(groupId, user._id);
            if (res.message === "success") {
                toast.success(`${user.nickname || user.name} removed from the group`);
            } else {
                toast.error(res.message || "Failed to remove member");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setIsRemoving(false);
            setShowConfirm(false);
        }
    };

    const isSelf = user._id?.toString() === currentUserId?.toString();

    return (
        <div
            id={`group-member-row-${user._id}`}
            className={`border-b border-gray-100 dark:border-slate-800 last:border-b-0 overflow-hidden transition-all duration-200 ${isSelf ? "bg-indigo-50/30 dark:bg-indigo-950/20" : "bg-white dark:bg-slate-900/60 hover:bg-gray-50/50 dark:hover:bg-slate-800/50"}`}
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
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-200 text-gray-500 font-semibold">
                        {user.image ? (
                            <img src={user.image} alt={user.nickname || user.name} className="h-full w-full object-cover" />
                        ) : (
                            (user.nickname || user.name).charAt(0).toUpperCase()
                        )}
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {user.nickname || user.name}
                        {isSelf && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide">You</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="block text-xl font-bold text-indigo-600 dark:text-indigo-400">{user.totalPoints}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Pts</span>
                    </div>

                    {isAdmin && !isSelf && (
                        <button
                            onClick={handleRemoveClick}
                            disabled={isRemoving}
                            className="bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 p-1.5 rounded-lg border border-red-200 transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
                            title={`Remove ${user.nickname || user.name} from group`}
                        >
                            <UserX size={16} />
                        </button>
                    )}

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
                        <UserPredictionsDropdown 
                            userId={user._id} 
                            isExpanded={isExpanded} 
                            allowedStages={allowedStages} 
                            stageMultipliers={stageMultipliers} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
                        onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Remove Member</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to remove <span className="font-bold text-gray-800 dark:text-gray-200">{user.nickname || user.name}</span> from this group?
                            </p>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                                    disabled={isRemoving}
                                    className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRemove}
                                    disabled={isRemoving}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center gap-1"
                                >
                                    {isRemoving ? "Removing..." : "Remove"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
