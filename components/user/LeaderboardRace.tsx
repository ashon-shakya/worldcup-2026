"use client";

import { useEffect, useState } from "react";
import { getLeaderboardTimeline } from "@/app/actions/leaderboard";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardRaceProps {
    groupId?: string;
}

interface TimelineUser {
    _id: string;
    name: string;
    nickname?: string;
    image?: string;
}

interface TimelineStep {
    matchId: string;
    homeTeam: {
        name: string;
        flagUrl?: string;
    };
    awayTeam: {
        name: string;
        flagUrl?: string;
    };
    homeScore: number;
    awayScore: number;
    kickOff: string;
    stage: string;
    scores: Record<string, number>;
}

export default function LeaderboardRace({ groupId }: LeaderboardRaceProps) {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<TimelineUser[]>([]);
    const [steps, setSteps] = useState<TimelineStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000); // interval duration in ms (1x = 1000ms)
    const [limit, setLimit] = useState<number>(10); // top 5, top 10, or all

    // Load timeline data
    useEffect(() => {
        let active = true;
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await getLeaderboardTimeline(groupId);
                if (active) {
                    setUsers(data.users);
                    setSteps(data.steps);
                    setCurrentStepIndex(0);
                }
            } catch (error) {
                console.error("Failed to load leaderboard race data:", error);
            } finally {
                if (active) setLoading(false);
            }
        };
        loadData();
        return () => {
            active = false;
        };
    }, [groupId]);

    // Animation interval loop
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPlaying && steps.length > 0) {
            interval = setInterval(() => {
                setCurrentStepIndex((prev) => {
                    if (prev < steps.length - 1) {
                        return prev + 1;
                    } else {
                        setIsPlaying(false);
                        return prev;
                    }
                });
            }, speed);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, speed, steps.length]);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 animate-pulse max-w-4xl mx-auto">
                {/* Header skeleton */}
                <div className="flex justify-between items-center">
                    <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
                    <div className="h-8 w-24 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                </div>

                {/* Current match skeleton */}
                <div className="bg-gray-50/50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-3">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded-full" />
                    <div className="flex items-center gap-6 w-full max-w-md">
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-12 h-8 bg-gray-200 dark:bg-slate-800 rounded-md" />
                            <div className="h-3 w-16 bg-gray-200 dark:bg-slate-800 rounded" />
                        </div>
                        <div className="h-10 w-16 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-12 h-8 bg-gray-200 dark:bg-slate-800 rounded-md" />
                            <div className="h-3 w-16 bg-gray-200 dark:bg-slate-800 rounded" />
                        </div>
                    </div>
                </div>

                {/* Bars skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 w-full">
                            <div className="w-8 h-4 bg-gray-200 dark:bg-slate-800 rounded" />
                            <div className="w-36 flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-slate-800" />
                                <div className="h-3 flex-1 bg-gray-200 dark:bg-slate-800 rounded" />
                            </div>
                            <div className="flex-1 h-7 bg-gray-250 dark:bg-slate-850 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (steps.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400 max-w-4xl mx-auto flex flex-col items-center gap-3 shadow-xs">
                <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                <h3 className="font-bold text-gray-900 dark:text-white">No Match Progression Yet</h3>
                <p className="text-sm text-gray-550 dark:text-gray-400 max-w-md text-center">
                    The bar chart race will appear here once prediction points are scored on finished matches.
                </p>
            </div>
        );
    }

    const currentStep = steps[currentStepIndex];
    const userMap = new Map(users.map(u => [u._id, u]));

    // Map users to their cumulative score at this match step
    const scoresAtStep = Object.entries(currentStep.scores).map(([userId, score]) => {
        const user = userMap.get(userId);
        return {
            userId,
            score: score as number,
            name: user?.nickname || user?.name || "Unknown User",
            image: user?.image
        };
    });

    // Sort descending by score, tie-break by name alphabetically to prevent visual sorting jitter
    const sortedScores = scoresAtStep.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    const maxScore = Math.max(...sortedScores.map(s => s.score), 1);
    const visibleScores = sortedScores.slice(0, limit);

    return (
        <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6">
            {/* Header / Playback controls */}
            <div className="bg-gray-50/30 dark:bg-slate-950/20 border border-gray-200/65 dark:border-slate-850 p-5 rounded-2xl shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Main play/pause/reset */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (currentStepIndex === steps.length - 1) {
                                    setCurrentStepIndex(0);
                                    setIsPlaying(true);
                                } else {
                                    setIsPlaying(!isPlaying);
                                }
                            }}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-slate-950 transition-colors shadow-sm cursor-pointer"
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        </button>

                        <button
                            onClick={() => {
                                setCurrentStepIndex(0);
                                setIsPlaying(false);
                            }}
                            className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                            title="Restart"
                        >
                            <RotateCcw size={16} />
                        </button>

                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1" />

                        {/* Step items */}
                        <button
                            onClick={() => {
                                setIsPlaying(false);
                                setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                            }}
                            disabled={currentStepIndex === 0}
                            className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Previous Match"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <button
                            onClick={() => {
                                setIsPlaying(false);
                                setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
                            }}
                            disabled={currentStepIndex === steps.length - 1}
                            className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Next Match"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Speeds and size limit */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Speed selector */}
                        <div className="flex items-center border border-gray-200 dark:border-slate-800 rounded-xl p-0.5 bg-gray-50/50 dark:bg-slate-950/20 text-xs font-semibold">
                            {[
                                { label: "0.5x", value: 2000 },
                                { label: "1x", value: 1000 },
                                { label: "1.5x", value: 600 },
                                { label: "2x", value: 300 }
                            ].map((s) => (
                                <button
                                    key={s.label}
                                    onClick={() => setSpeed(s.value)}
                                    className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${speed === s.value ? "bg-white dark:bg-slate-800 shadow-2xs text-indigo-600 dark:text-cyan-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-250"}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Size limit selector */}
                        <div className="flex items-center border border-gray-200 dark:border-slate-800 rounded-xl p-0.5 bg-gray-50/50 dark:bg-slate-950/20 text-xs font-semibold">
                            {[
                                { label: "Top 5", value: 5 },
                                { label: "Top 10", value: 10 },
                                { label: "All", value: 999 }
                            ].map((l) => (
                                <button
                                    key={l.label}
                                    onClick={() => setLimit(l.value)}
                                    className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${limit === l.value ? "bg-white dark:bg-slate-800 shadow-2xs text-indigo-600 dark:text-cyan-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-250"}`}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline slider */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        <span>Start (Match 1)</span>
                        <span>Finish (Match {steps.length})</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={steps.length - 1}
                        value={currentStepIndex}
                        onChange={(e) => {
                            setCurrentStepIndex(Number(e.target.value));
                            setIsPlaying(false);
                        }}
                        className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-cyan-400"
                    />
                </div>
            </div>

            {/* Current match display */}
            <div className="bg-gray-50/50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
                <div className="absolute inset-0 bg-radial from-indigo-500/5 to-transparent pointer-events-none" />

                <span className="text-[10px] font-black text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-3 z-10">
                    Match {currentStepIndex + 1} of {steps.length}
                </span>

                <div className="flex items-center justify-center gap-6 w-full max-w-md z-10">
                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                        {currentStep.homeTeam.flagUrl ? (
                            <img
                                src={currentStep.homeTeam.flagUrl}
                                alt={currentStep.homeTeam.name}
                                className="w-12 h-8 object-cover rounded-md shadow-sm border border-gray-200 dark:border-slate-800 shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-8 bg-gray-200 dark:bg-slate-800 rounded-md flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                                FLAG
                            </div>
                        )}
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-250 truncate text-center w-full">
                            {currentStep.homeTeam.name}
                        </span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                        <div className="text-2xl font-black text-gray-900 dark:text-white px-3 py-1 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xs">
                            {currentStep.homeScore} - {currentStep.awayScore}
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                        {currentStep.awayTeam.flagUrl ? (
                            <img
                                src={currentStep.awayTeam.flagUrl}
                                alt={currentStep.awayTeam.name}
                                className="w-12 h-8 object-cover rounded-md shadow-sm border border-gray-200 dark:border-slate-800 shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-8 bg-gray-200 dark:bg-slate-800 rounded-md flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                                FLAG
                            </div>
                        )}
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-250 truncate text-center w-full">
                            {currentStep.awayTeam.name}
                        </span>
                    </div>
                </div>

                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-3 uppercase tracking-wider z-10 flex items-center gap-1.5">
                    <span>{currentStep.stage}</span>
                    <span>•</span>
                    <span>
                        {new Date(currentStep.kickOff).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </span>
                </div>
            </div>

            {/* Reordering bar chart race */}
            <div className="space-y-3 min-h-[300px] flex flex-col justify-start relative overflow-hidden">
                <AnimatePresence initial={false}>
                    {visibleScores.map((item, index) => {
                        const widthPercent = (item.score / maxScore) * 100;

                        // Highlight top ranks
                        let rankColor = "text-gray-550 dark:text-gray-450";
                        let barColor = "from-indigo-500 to-purple-600 dark:from-cyan-500 dark:to-indigo-600";
                        let rankIcon = null;

                        if (index === 0) {
                            rankColor = "text-yellow-500 dark:text-yellow-400 font-extrabold";
                            barColor = "from-amber-400 via-yellow-400 to-amber-500";
                            rankIcon = "🥇";
                        } else if (index === 1) {
                            rankColor = "text-slate-400 dark:text-slate-300 font-extrabold";
                            barColor = "from-slate-300 via-slate-200 to-slate-400";
                            rankIcon = "🥈";
                        } else if (index === 2) {
                            rankColor = "text-amber-600 dark:text-amber-550 font-extrabold";
                            barColor = "from-orange-400 via-amber-600 to-orange-500";
                            rankIcon = "🥉";
                        }

                        return (
                            <motion.div
                                key={item.userId}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="flex items-center gap-3 w-full"
                            >
                                {/* Rank Icon or Number */}
                                <div className={`w-6 sm:w-8 text-center text-xs sm:text-sm font-bold flex items-center justify-center shrink-0 ${rankColor}`}>
                                    {rankIcon || index + 1}
                                </div>

                                {/* Avatar & Username */}
                                <div className="flex items-center gap-1.5 sm:gap-2.5 w-24 sm:w-36 shrink-0 truncate">
                                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px] sm:text-xs text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-900/50 overflow-hidden shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            item.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-bold text-gray-900 dark:text-gray-200 truncate">
                                        {item.name}
                                    </span>
                                </div>

                                {/* The animated bar */}
                                <div className="flex-1 bg-gray-100 dark:bg-slate-800/40 rounded-full h-7 overflow-hidden relative border border-gray-200/50 dark:border-slate-800/60 flex items-center shadow-3xs">
                                    <motion.div
                                        layout
                                        className={`h-full bg-gradient-to-r ${barColor} rounded-full absolute left-0 top-0`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${widthPercent}%` }}
                                        transition={{ type: "tween", duration: speed / 1000 }}
                                    />
                                    <span className="absolute right-1.5 sm:right-3 text-[9px] sm:text-[10px] font-black text-gray-900 dark:text-gray-100 z-10 bg-white/70 dark:bg-slate-950/70 border border-gray-200/40 dark:border-slate-800/40 px-1 sm:px-1.5 py-0.5 rounded shadow-3xs">
                                        {item.score} PTS
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
