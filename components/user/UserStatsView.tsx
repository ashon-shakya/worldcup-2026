"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    Activity,
    TrendingUp,
    Target,
    Percent,
    Award,
    Zap,
    BarChart3,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    HelpCircle,
    Calendar,
    Sparkles,
    Flame
} from "lucide-react";
import Link from "next/link";

interface TeamDetail {
    name: string;
    shortName: string;
    flagUrl: string;
}

interface TimelineItem {
    matchId: string;
    homeTeam: TeamDetail;
    awayTeam: TeamDetail;
    predictedScore: string;
    actualScore: string;
    points: number;
    kickOff: string;
}

interface StageBreakdownItem {
    stage: string;
    count: number;
    totalPoints: number;
    averagePoints: number;
    accuracy: number;
}

interface TeamStatItem {
    name: string;
    shortName: string;
    flagUrl: string;
    averagePoints: number;
    count: number;
}

interface StatsProps {
    stats: {
        userId: string;
        user: {
            name: string;
            nickname?: string;
            email: string;
            image?: string;
        };
        globalRank: number;
        totalCompetitors: number;
        totalPoints: number;
        totalPredictionsMade: number;
        totalCompleted: number;
        averagePointsPerMatch: number;
        accuracyRate: number;
        exactScoreRate: number;
        pointsDistribution: {
            perfect: number;
            nearMiss: number;
            scoreOnly: number;
            outcomeOnly: number;
            zero: number;
        };
        goalStats: {
            totalPredictedGoals: number;
            totalActualGoals: number;
            averagePredictedGoals: number;
            averageActualGoals: number;
        };
        mostPredictedScoreline: string;
        stageBreakdown: StageBreakdownItem[];
        bestTeam: TeamStatItem | null;
        worstTeam: TeamStatItem | null;
        pointsTimeline: TimelineItem[];
    };
}

export default function UserStatsView({ stats }: StatsProps) {
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [hoveredDist, setHoveredDist] = useState<number | null>(null);

    const displayName = stats.user.nickname || stats.user.name;

    // Distribution data for the custom bar graph
    const distributionData = [
        {
            id: 0,
            label: "Perfect Score",
            pts: "13 / 16 PTS",
            count: stats.pointsDistribution.perfect,
            color: "bg-emerald-500 dark:bg-emerald-400",
            glow: "shadow-emerald-500/20 dark:shadow-emerald-400/20",
            border: "border-emerald-200 dark:border-emerald-900/30",
            desc: "Correct outcome and both team scores correct (or knockout penalty winner match)"
        },
        {
            id: 1,
            label: "Near Miss",
            pts: "8 PTS",
            count: stats.pointsDistribution.nearMiss,
            color: "bg-indigo-500 dark:bg-indigo-400",
            glow: "shadow-indigo-500/20 dark:shadow-indigo-400/20",
            border: "border-indigo-200 dark:border-indigo-900/30",
            desc: "Correct outcome and exactly one team score correct"
        },
        {
            id: 2,
            label: "Score Only",
            pts: "5 PTS",
            count: stats.pointsDistribution.scoreOnly,
            color: "bg-amber-500 dark:bg-amber-400",
            glow: "shadow-amber-500/20 dark:shadow-amber-400/20",
            border: "border-amber-200 dark:border-amber-900/30",
            desc: "Incorrect outcome but one team score correct (e.g. predicted 2-1, actual 1-1)"
        },
        {
            id: 3,
            label: "Outcome Only",
            pts: "3 / 6 PTS",
            count: stats.pointsDistribution.outcomeOnly,
            color: "bg-cyan-500 dark:bg-cyan-400",
            glow: "shadow-cyan-500/20 dark:shadow-cyan-400/20",
            border: "border-cyan-200 dark:border-cyan-900/30",
            desc: "Correct outcome (win/draw) or penalty prediction, but both scorelines incorrect"
        },
        {
            id: 4,
            label: "Zero Points",
            pts: "0 PTS",
            count: stats.pointsDistribution.zero,
            color: "bg-slate-400 dark:bg-slate-600",
            glow: "shadow-slate-500/10",
            border: "border-slate-200 dark:border-slate-800",
            desc: "Completely incorrect prediction"
        }
    ];

    const maxDistCount = Math.max(...distributionData.map((d) => d.count), 1);
    const totalFinished = stats.totalCompleted;

    // Timeline calculations
    const recentPredictions = stats.pointsTimeline;

    // Stage rank progression placeholder or similar
    const rankPercentile = stats.totalCompetitors > 0 
        ? Math.max(1, Math.round(((stats.totalCompetitors - stats.globalRank + 1) / stats.totalCompetitors) * 100))
        : 100;

    return (
        <div className="space-y-8 pb-12">
            {/* 1. Profile Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-850 p-6 md:p-8 text-white shadow-2xl"
            >
                {/* Background decorative glowing circles */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                        {stats.user.image ? (
                            <img
                                src={stats.user.image}
                                alt={displayName}
                                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-400 shadow-lg"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-lg border-2 border-indigo-400">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{displayName}</h1>
                                {stats.globalRank <= 3 && totalFinished > 0 && (
                                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider animate-pulse">
                                        <Trophy className="w-3 h-3 fill-slate-950" /> Podium
                                    </span>
                                )}
                            </div>
                            <p className="text-indigo-200 text-sm mt-1 sm:mt-0 font-medium">World Cup 2026 Prediction Statistics</p>
                            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/5 text-indigo-150">
                                    Predictions Active: {stats.totalPredictionsMade}
                                </span>
                                <span className="bg-indigo-500/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-indigo-400/20 text-cyan-300">
                                    Ranked {rankPercentile}% of players
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 sm:gap-6 border-t border-indigo-800/40 pt-4 md:border-t-0 md:pt-0 w-full md:w-auto justify-around md:justify-end">
                        <div className="text-center">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block">Global Rank</span>
                            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                                #{stats.globalRank}
                            </span>
                            <span className="text-gray-400 text-xs block font-medium">of {stats.totalCompetitors}</span>
                        </div>
                        <div className="w-px bg-indigo-800/40 self-stretch"></div>
                        <div className="text-center">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block">Total Points</span>
                            <span className="text-3xl sm:text-4xl font-black text-amber-400 drop-shadow-md">
                                {stats.totalPoints}
                            </span>
                            <span className="text-indigo-200 text-xs block font-medium">PTS</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 2. Key Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    {
                        title: "Accuracy Rate",
                        value: `${stats.accuracyRate.toFixed(1)}%`,
                        sub: "Outcome predicted correctly",
                        icon: Target,
                        color: "text-indigo-600 dark:text-cyan-400",
                        bg: "bg-indigo-50 dark:bg-indigo-950/20",
                        border: "border-indigo-100 dark:border-indigo-950/40",
                        tooltip: "The percentage of matches where you correctly picked the outcome (Home Win, Draw, or Away Win)."
                    },
                    {
                        title: "Exact Scores",
                        value: `${stats.exactScoreRate.toFixed(1)}%`,
                        sub: `${stats.pointsDistribution.perfect} perfect predictions`,
                        icon: Award,
                        color: "text-emerald-600 dark:text-emerald-400",
                        bg: "bg-emerald-50 dark:bg-emerald-950/10",
                        border: "border-emerald-100 dark:border-emerald-950/30",
                        tooltip: "The percentage of completed matches where you predicted the home and away scores exactly right."
                    },
                    {
                        title: "Average Score",
                        value: `${stats.averagePointsPerMatch.toFixed(2)}`,
                        sub: "Points per finished match",
                        icon: TrendingUp,
                        color: "text-amber-600 dark:text-amber-400",
                        bg: "bg-amber-50 dark:bg-amber-950/10",
                        border: "border-amber-100 dark:border-amber-950/30",
                        tooltip: "Your total earned points divided by your completed predictions."
                    },
                    {
                        title: "Matches Finished",
                        value: `${stats.totalCompleted}`,
                        sub: `out of ${stats.totalPredictionsMade} predicted`,
                        icon: Activity,
                        color: "text-cyan-600 dark:text-indigo-400",
                        bg: "bg-cyan-50/50 dark:bg-cyan-950/10",
                        border: "border-cyan-100 dark:border-cyan-950/20",
                        tooltip: "The number of your predicted matches that have completed and scored points."
                    }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className={`bg-white dark:bg-slate-900 border ${stat.border} rounded-2xl p-4 sm:p-5 shadow-sm relative group hover:shadow-md transition-all duration-300`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 text-xs font-semibold tracking-wide">{stat.title}</p>
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                                <p className="text-gray-400 dark:text-slate-500 text-[10px] sm:text-xs font-medium mt-0.5">{stat.sub}</p>
                            </div>
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        {/* Hover Tooltip Info */}
                        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <span className="text-[9px] bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">Info</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 3. Main Stats Charts Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 3A. Points Distribution Graph */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-slate-800 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                                Points Distribution
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Frequency of points scored across your predictions</p>
                        </div>
                    </div>

                    {totalFinished === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400">
                            <Zap className="w-10 h-10 mb-2 stroke-1" />
                            <p className="text-sm font-medium">Predict matches and wait for final scores to see your points distribution.</p>
                            <Link href="/dashboard/matches" className="text-indigo-600 dark:text-cyan-400 text-xs font-bold hover:underline mt-2">
                                Predict matches now &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Distribution Bars */}
                            <div className="flex flex-col gap-4">
                                {distributionData.map((data) => {
                                    const percent = totalFinished > 0 ? (data.count / totalFinished) * 100 : 0;
                                    const barWidth = totalFinished > 0 ? (data.count / maxDistCount) * 100 : 0;

                                    return (
                                        <div
                                            key={data.id}
                                            className="relative flex items-center group cursor-help"
                                            onMouseEnter={() => setHoveredDist(data.id)}
                                            onMouseLeave={() => setHoveredDist(null)}
                                        >
                                            {/* Label Info */}
                                            <div className="w-24 sm:w-28 text-left pr-2 flex-shrink-0">
                                                <p className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">{data.label}</p>
                                                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono font-bold">{data.pts}</span>
                                            </div>

                                            {/* Bar Track */}
                                            <div className="flex-1 bg-gray-50 dark:bg-slate-950 rounded-full h-8 overflow-hidden relative border border-gray-100 dark:border-slate-800">
                                                {/* Animated bar */}
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.max(barWidth, 2)}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className={`h-full ${data.color} rounded-full relative flex items-center justify-end px-3 shadow-md ${data.glow}`}
                                                >
                                                    {data.count > 0 && barWidth > 15 && (
                                                        <span className="text-[10px] font-black text-white drop-shadow-sm select-none">
                                                            {data.count} ({percent.toFixed(0)}%)
                                                        </span>
                                                    )}
                                                </motion.div>

                                                {/* If bar width is too small, show label outside the bar */}
                                                {(data.count === 0 || barWidth <= 15) && (
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 dark:text-slate-400">
                                                        {data.count} ({percent.toFixed(0)}%)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Help Description Section */}
                            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 min-h-[72px] flex items-start gap-2.5 transition-all duration-300">
                                <HelpCircle className="w-4 h-4 text-indigo-500 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {hoveredDist !== null
                                            ? distributionData[hoveredDist].desc
                                            : "Hover over a row to understand what predictions grant these points. Perfect score predicts match goals exactly, while Near Miss gets correct outcome plus one score."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3B. Summary Point Cards & Streaks */}
                <div className="space-y-6">
                    {/* Points Summary Breakdown Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col justify-between h-full">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                Prediction Insights
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Specialized stat benchmarks</p>
                        </div>

                        <div className="space-y-4 my-6">
                            {[
                                {
                                    name: "Full Point Predictions (+13/16)",
                                    count: stats.pointsDistribution.perfect,
                                    percent: totalFinished > 0 ? (stats.pointsDistribution.perfect / totalFinished) * 100 : 0,
                                    color: "bg-emerald-500",
                                    label: "Full Points"
                                },
                                {
                                    name: "Single Score Predictions (+5)",
                                    count: stats.pointsDistribution.scoreOnly,
                                    percent: totalFinished > 0 ? (stats.pointsDistribution.scoreOnly / totalFinished) * 100 : 0,
                                    color: "bg-amber-500",
                                    label: "Score Only"
                                },
                                {
                                    name: "Outcome-only Predictions (+3/6)",
                                    count: stats.pointsDistribution.outcomeOnly,
                                    percent: totalFinished > 0 ? (stats.pointsDistribution.outcomeOnly / totalFinished) * 100 : 0,
                                    color: "bg-cyan-500",
                                    label: "Outcome"
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-gray-600 dark:text-slate-350">{item.name}</span>
                                        <span className="font-mono text-gray-900 dark:text-white font-bold">{item.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-150 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color}`}
                                            style={{ width: `${item.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-950/20 text-center">
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest font-bold">Favorite Scoreline Predicted</span>
                            <p className="text-2xl font-black text-indigo-600 dark:text-cyan-400 mt-0.5">{stats.mostPredictedScoreline}</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* 4. Chronological Match Points Timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-slate-800">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                        Match Points Timeline
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Your points earned on your last 15 completed predictions (ordered chronologically)</p>
                </div>

                {recentPredictions.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                        No finished prediction history to display.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Horizontal Scroll Bar Graph container */}
                        <div className="overflow-x-auto pb-4 pt-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
                            <div className="flex items-end gap-3 sm:gap-4 min-w-[750px] h-60 px-4 relative">
                                {/* Horizontal grid guidelines */}
                                <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-150 dark:border-slate-800 pointer-events-none flex justify-between">
                                    <span className="text-[9px] text-gray-400 dark:text-slate-500 font-mono -mt-2">16 pts (Max)</span>
                                </div>
                                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-150 dark:border-slate-800 pointer-events-none flex justify-between">
                                    <span className="text-[9px] text-gray-400 dark:text-slate-500 font-mono -mt-2">8 pts</span>
                                </div>
                                <div className="absolute inset-x-0 bottom-16 border-t border-dashed border-gray-150 dark:border-slate-800 pointer-events-none flex justify-between">
                                    <span className="text-[9px] text-gray-400 dark:text-slate-500 font-mono -mt-2">0 pts</span>
                                </div>

                                {recentPredictions.map((item, idx) => {
                                    // Height percentage calculation (out of 16 points)
                                    const heightPercent = (item.points / 16) * 100;
                                    
                                    // Style colors based on points
                                    let barColor = "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700";
                                    let barGlow = "shadow-xs";
                                    if (item.points >= 13) {
                                        barColor = "bg-gradient-to-t from-emerald-600 to-emerald-400";
                                        barGlow = "shadow-md shadow-emerald-500/20 dark:shadow-emerald-400/10";
                                    } else if (item.points === 8) {
                                        barColor = "bg-gradient-to-t from-indigo-600 to-indigo-400";
                                        barGlow = "shadow-md shadow-indigo-500/20 dark:shadow-indigo-400/10";
                                    } else if (item.points === 5) {
                                        barColor = "bg-gradient-to-t from-amber-600 to-amber-400";
                                        barGlow = "shadow-md shadow-amber-500/20 dark:shadow-amber-400/10";
                                    } else if (item.points === 3 || item.points === 6) {
                                        barColor = "bg-gradient-to-t from-cyan-600 to-cyan-400";
                                        barGlow = "shadow-md shadow-cyan-500/20 dark:shadow-cyan-400/10";
                                    }

                                    return (
                                        <div
                                            key={item.matchId}
                                            className="flex-1 flex flex-col items-center h-full relative cursor-pointer"
                                            onMouseEnter={() => setHoveredBar(idx)}
                                            onMouseLeave={() => setHoveredBar(null)}
                                        >
                                            {/* Bar */}
                                            <div className="w-full flex-1 flex flex-col justify-end">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                                                    transition={{ duration: 0.6, delay: idx * 0.03 }}
                                                    className={`w-full rounded-t-lg transition-all duration-300 ${barColor} ${barGlow} flex items-start justify-center pt-1.5`}
                                                >
                                                    <span className="text-[10px] font-black text-white select-none drop-shadow-sm">
                                                        {item.points}
                                                    </span>
                                                </motion.div>
                                            </div>

                                            {/* Label below bar */}
                                            <div className="h-16 mt-2 flex flex-col items-center justify-start text-center">
                                                <div className="flex gap-0.5 items-center justify-center">
                                                    {item.homeTeam.flagUrl && (
                                                        <img
                                                            src={item.homeTeam.flagUrl}
                                                            alt=""
                                                            className="w-4 h-2.5 object-cover rounded-xs border border-gray-200 dark:border-slate-800"
                                                        />
                                                    )}
                                                    <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500">v</span>
                                                    {item.awayTeam.flagUrl && (
                                                        <img
                                                            src={item.awayTeam.flagUrl}
                                                            alt=""
                                                            className="w-4 h-2.5 object-cover rounded-xs border border-gray-200 dark:border-slate-800"
                                                        />
                                                    )}
                                                </div>
                                                <span className="text-[9px] font-black text-gray-800 dark:text-slate-300 mt-1 uppercase">
                                                    {item.homeTeam.shortName} - {item.awayTeam.shortName}
                                                </span>
                                                <span className="text-[8px] font-medium text-gray-450 dark:text-slate-500">
                                                    {new Date(item.kickOff).toLocaleDateString(undefined, {
                                                        month: "short",
                                                        day: "numeric"
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Timeline Tooltip Details */}
                        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 min-h-[92px] transition-all duration-300">
                            {hoveredBar !== null ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            {recentPredictions[hoveredBar].homeTeam.flagUrl && (
                                                <img src={recentPredictions[hoveredBar].homeTeam.flagUrl} className="w-6 h-4 object-cover rounded border" alt="" />
                                            )}
                                            <span className="font-bold text-gray-900 dark:text-white">{recentPredictions[hoveredBar].homeTeam.name}</span>
                                        </div>
                                        <span className="text-gray-400 text-xs font-bold">vs</span>
                                        <div className="flex items-center gap-1.5">
                                            {recentPredictions[hoveredBar].awayTeam.flagUrl && (
                                                <img src={recentPredictions[hoveredBar].awayTeam.flagUrl} className="w-6 h-4 object-cover rounded border" alt="" />
                                            )}
                                            <span className="font-bold text-gray-900 dark:text-white">{recentPredictions[hoveredBar].awayTeam.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                                        <span className="bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-1 rounded-lg">
                                            Prediction: <span className="font-mono font-black">{recentPredictions[hoveredBar].predictedScore}</span>
                                        </span>
                                        <span className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                                            Actual score: <span className="font-mono font-black">{recentPredictions[hoveredBar].actualScore}</span>
                                        </span>
                                        <span className="bg-amber-400 text-slate-900 px-2.5 py-1 rounded-lg font-black text-xs">
                                            +{recentPredictions[hoveredBar].points} PTS
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex items-center gap-2.5 text-gray-400 dark:text-slate-500 h-full py-2 justify-center sm:justify-start">
                                    <HelpCircle className="w-4 h-4 text-indigo-500 dark:text-cyan-400 flex-shrink-0" />
                                    <p className="text-xs font-medium">Hover over any bar in the timeline to inspect match prediction details and scores.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 5. Goal Stats & Team Insights Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 5A. Goal Statistics Comparison */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                            Goal Analysis
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Comparing your predicted match goals against actual results</p>
                    </div>

                    {totalFinished === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-sm">No goal stats available yet.</div>
                    ) : (
                        <div className="space-y-6 my-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 text-center">
                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest font-bold block">Total Goals Predicted</span>
                                    <span className="text-3xl font-black text-gray-900 dark:text-white block mt-1">{stats.goalStats.totalPredictedGoals}</span>
                                    <span className="text-xs text-gray-400 dark:text-slate-500 block font-medium">Avg {stats.goalStats.averagePredictedGoals.toFixed(1)} / Match</span>
                                </div>
                                <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/30 dark:border-indigo-950/20 text-center">
                                    <span className="text-[10px] text-indigo-400/80 dark:text-indigo-400 uppercase tracking-widest font-bold block">Total Actual Goals</span>
                                    <span className="text-3xl font-black text-indigo-600 dark:text-cyan-400 block mt-1">{stats.goalStats.totalActualGoals}</span>
                                    <span className="text-xs text-gray-400 dark:text-slate-500 block font-medium">Avg {stats.goalStats.averageActualGoals.toFixed(1)} / Match</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-slate-350">
                                    <span>Goal Bias (Average Goals Comparison)</span>
                                    <span>{stats.goalStats.averagePredictedGoals > stats.goalStats.averageActualGoals ? "High-scoring bias" : "Low-scoring bias"}</span>
                                </div>
                                <div className="relative h-4 bg-gray-150 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
                                    <div
                                        className="h-full bg-indigo-500 absolute left-0"
                                        style={{ width: `${(stats.goalStats.averagePredictedGoals / Math.max(stats.goalStats.averagePredictedGoals + stats.goalStats.averageActualGoals, 1)) * 100}%` }}
                                    ></div>
                                    <div
                                        className="h-full bg-cyan-400 absolute right-0"
                                        style={{ width: `${(stats.goalStats.averageActualGoals / Math.max(stats.goalStats.averagePredictedGoals + stats.goalStats.averageActualGoals, 1)) * 100}%` }}
                                    ></div>
                                    {/* Divider */}
                                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white dark:bg-slate-900 z-10"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                    <span>Predicted Avg: {stats.goalStats.averagePredictedGoals.toFixed(1)}</span>
                                    <span>Actual Avg: {stats.goalStats.averageActualGoals.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 5B. Team Predictions Accuracy */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                            Team Accuracy Insights
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Teams you predict with the highest or lowest points return</p>
                    </div>

                    {!stats.bestTeam && !stats.worstTeam ? (
                        <div className="py-8 text-center text-gray-400 text-sm">No team prediction insights available.</div>
                    ) : (
                        <div className="space-y-4 my-6">
                            {/* Best Team */}
                            {stats.bestTeam && (
                                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-950/20 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {stats.bestTeam.flagUrl ? (
                                            <img src={stats.bestTeam.flagUrl} alt="" className="w-10 h-7 object-cover rounded shadow-xs border border-white/20" />
                                        ) : (
                                            <div className="w-10 h-7 bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold rounded">{stats.bestTeam.shortName}</div>
                                        )}
                                        <div>
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">Best Team Predicted</span>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{stats.bestTeam.name}</h4>
                                            <p className="text-[10px] text-gray-450 dark:text-slate-500 font-medium">({stats.bestTeam.count} match predictions)</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5 justify-end">
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                            {stats.bestTeam.averagePoints.toFixed(1)}
                                        </div>
                                        <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase">Avg PTS</span>
                                    </div>
                                </div>
                            )}

                            {/* Worst Team */}
                            {stats.worstTeam && (
                                <div className="p-3 bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-100/50 dark:border-red-950/20 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {stats.worstTeam.flagUrl ? (
                                            <img src={stats.worstTeam.flagUrl} alt="" className="w-10 h-7 object-cover rounded shadow-xs border border-white/20" />
                                        ) : (
                                            <div className="w-10 h-7 bg-red-100 flex items-center justify-center text-red-800 font-bold rounded">{stats.worstTeam.shortName}</div>
                                        )}
                                        <div>
                                            <span className="text-[10px] text-red-500 dark:text-red-400 font-bold uppercase tracking-wider block">Hardest Team to Predict</span>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{stats.worstTeam.name}</h4>
                                            <p className="text-[10px] text-gray-450 dark:text-slate-500 font-medium">({stats.worstTeam.count} match predictions)</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-red-650 dark:text-red-400 flex items-center gap-0.5 justify-end">
                                            <ArrowDownRight className="w-3.5 h-3.5" />
                                            {stats.worstTeam.averagePoints.toFixed(1)}
                                        </div>
                                        <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase">Avg PTS</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* 6. Predictions Stage Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-slate-800">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                        Stage Performance Breakdown
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Analysis of points scored and accuracy by tournament stage</p>
                </div>

                {stats.stageBreakdown.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">No stage breakdown statistics available.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400">
                            <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-950/40 rounded-2xl">
                                <tr>
                                    <th scope="col" className="px-4 py-3 sm:px-6 rounded-l-2xl font-bold">Stage</th>
                                    <th scope="col" className="px-4 py-3 sm:px-6 font-bold text-center">Predictions Made</th>
                                    <th scope="col" className="px-4 py-3 sm:px-6 font-bold text-center">Total Points</th>
                                    <th scope="col" className="px-4 py-3 sm:px-6 font-bold text-center">Avg Points</th>
                                    <th scope="col" className="px-4 py-3 sm:px-6 rounded-r-2xl font-bold text-center">Outcome Accuracy</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {stats.stageBreakdown.map((row, idx) => (
                                    <tr key={idx} className="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3.5 sm:px-6 font-bold text-gray-900 dark:text-white">{row.stage}</td>
                                        <td className="px-4 py-3.5 sm:px-6 text-center font-semibold text-gray-700 dark:text-slate-350">{row.count}</td>
                                        <td className="px-4 py-3.5 sm:px-6 text-center font-bold text-amber-500">{row.totalPoints}</td>
                                        <td className="px-4 py-3.5 sm:px-6 text-center font-mono font-bold text-indigo-650 dark:text-indigo-400">
                                            {row.averagePoints.toFixed(1)}
                                        </td>
                                        <td className="px-4 py-3.5 sm:px-6 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <div className="w-12 bg-gray-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                                    <div
                                                        className="h-full bg-cyan-400"
                                                        style={{ width: `${row.accuracy}%` }}
                                                    ></div>
                                                </div>
                                                <span className="font-mono font-bold text-slate-850 dark:text-slate-300">{row.accuracy.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-center pt-4">
                <Link
                    href="/dashboard/matches"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3.5 rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-300"
                >
                    Predict More Matches
                    <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>

        </div>
    );
}
