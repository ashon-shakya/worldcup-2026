"use server";

import { auth } from "@/auth";
import { Match, Prediction, User, Team } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import { getGlobalLeaderboard } from "./leaderboard";
import { getPointSettings } from "./admin/settings";
import { unstable_noStore as noStore } from "next/cache";

export async function getUserStatsPageData() {
    noStore();
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    await connectToDatabase();

    // 1. Fetch user predictions with populated matches and teams
    const predictions = await Prediction.find({ user: userId })
        .populate({
            path: "match",
            populate: [
                { path: "homeTeam", model: "Team" },
                { path: "awayTeam", model: "Team" },
                { path: "winner", model: "Team" }
            ]
        })
        .populate("predictedWinner");

    // 2. Fetch point settings
    const settings = await getPointSettings();

    // 3. Fetch global leaderboard for ranking
    const leaderboard = await getGlobalLeaderboard();
    let rank = leaderboard.findIndex((item: any) => item._id.toString() === userId) + 1;
    if (rank === 0) {
        rank = leaderboard.length + 1;
    }

    // Filter predictions that correspond to finished matches
    const completedPredictions = predictions.filter(
        (p: any) => p.match && p.match.status === "FINISHED"
    );

    // Sort completed predictions chronologically by kickoff
    completedPredictions.sort((a: any, b: any) => {
        return new Date(a.match.kickOff).getTime() - new Date(b.match.kickOff).getTime();
    });

    // Basic Stats Calculations
    const totalPoints = completedPredictions.reduce((sum: number, p: any) => sum + (p.points || 0), 0);
    const totalPredictionsMade = predictions.length;
    const totalCompleted = completedPredictions.length;
    const averagePointsPerMatch = totalCompleted > 0 ? totalPoints / totalCompleted : 0;

    // Distribution Counts
    let perfectCount = 0;   // >= 13 points (perfect prediction / exact score)
    let nearMissCount = 0;  // 8 points (outcome + 1 score correct)
    let scoreOnlyCount = 0; // 5 points (1 score correct, outcome wrong)
    let outcomeOnlyCount = 0; // 3 or 6 points (outcome correct, scores wrong)
    let zeroPointsCount = 0; // 0 points

    let correctOutcomesCount = 0;
    let exactScoresCount = 0;
    let totalPredictedGoals = 0;
    let totalActualGoals = 0;

    const scorelineFrequencies: Record<string, number> = {};
    const stageStats: Record<string, { totalPoints: number; count: number; correctOutcomes: number }> = {};
    const teamStats: Record<string, { totalPoints: number; count: number; teamInfo: any }> = {};

    completedPredictions.forEach((p: any) => {
        const match = p.match;
        const pts = p.points || 0;

        // Categorize points distribution
        if (pts >= 13) {
            perfectCount++;
        } else if (pts === 8) {
            nearMissCount++;
        } else if (pts === 5) {
            scoreOnlyCount++;
        } else if (pts === 3 || pts === 6) {
            outcomeOnlyCount++;
        } else {
            zeroPointsCount++;
        }

        // Check if outcome is correct
        const isKnockout = match.isKnockout || ["Round of 32", "Round of 16", "Quarter Final", "Semi Final", "Final", "3rd Place"].includes(match.stage);
        const predOutcome = Math.sign(p.homeScore - p.awayScore);
        const actualOutcome = Math.sign(match.homeScore - match.awayScore);

        let outcomeCorrect = false;
        if (isKnockout && p.homeScore === p.awayScore) {
            if (match.wentToPenalties) {
                const predWinnerId = p.predictedWinner?._id?.toString() || p.predictedWinner?.toString();
                const actualWinnerId = match.winner?._id?.toString() || match.winner?.toString();
                outcomeCorrect = predWinnerId && actualWinnerId && predWinnerId === actualWinnerId;
            }
        } else {
            outcomeCorrect = predOutcome === actualOutcome;
        }

        if (outcomeCorrect) {
            correctOutcomesCount++;
        }

        // Check if exact score is correct
        if (p.homeScore === match.homeScore && p.awayScore === match.awayScore) {
            exactScoresCount++;
        }

        // Goals accumulation
        totalPredictedGoals += (p.homeScore + p.awayScore);
        totalActualGoals += (match.homeScore + match.awayScore);

        // Scoreline frequency
        const scoreline = `${p.homeScore}-${p.awayScore}`;
        scorelineFrequencies[scoreline] = (scorelineFrequencies[scoreline] || 0) + 1;

        // Stage Breakdown
        const stage = match.stage || "Group Stage";
        if (!stageStats[stage]) {
            stageStats[stage] = { totalPoints: 0, count: 0, correctOutcomes: 0 };
        }
        stageStats[stage].totalPoints += pts;
        stageStats[stage].count += 1;
        if (outcomeCorrect) {
            stageStats[stage].correctOutcomes += 1;
        }

        // Team stats accumulation
        const processTeam = (team: any) => {
            if (!team) return;
            const tId = team._id.toString();
            if (!teamStats[tId]) {
                teamStats[tId] = { totalPoints: 0, count: 0, teamInfo: team };
            }
            teamStats[tId].totalPoints += pts;
            teamStats[tId].count += 1;
        };
        processTeam(match.homeTeam);
        processTeam(match.awayTeam);
    });

    // Find most predicted scoreline
    let mostPredictedScoreline = "-";
    let maxFreq = 0;
    Object.entries(scorelineFrequencies).forEach(([score, freq]) => {
        if (freq > maxFreq) {
            maxFreq = freq;
            mostPredictedScoreline = score;
        }
    });

    // Format Stage Breakdown for UI
    const stageBreakdown = Object.entries(stageStats).map(([stageName, data]) => ({
        stage: stageName,
        count: data.count,
        totalPoints: data.totalPoints,
        averagePoints: data.count > 0 ? data.totalPoints / data.count : 0,
        accuracy: data.count > 0 ? (data.correctOutcomes / data.count) * 100 : 0
    }));

    // Find best and worst teams to predict (min 2 matches for significance, if available)
    let bestTeam = null;
    let worstTeam = null;
    let maxAvgPoints = -1;
    let minAvgPoints = 999;

    const teamStatsList = Object.values(teamStats);
    // Sort by count to prefer teams with more predictions
    teamStatsList.forEach((stat: any) => {
        if (stat.count >= 1) {
            const avg = stat.totalPoints / stat.count;
            if (avg > maxAvgPoints) {
                maxAvgPoints = avg;
                bestTeam = {
                    name: stat.teamInfo.name,
                    shortName: stat.teamInfo.shortName,
                    flagUrl: stat.teamInfo.flagUrl,
                    averagePoints: avg,
                    count: stat.count
                };
            }
            if (avg < minAvgPoints) {
                minAvgPoints = avg;
                worstTeam = {
                    name: stat.teamInfo.name,
                    shortName: stat.teamInfo.shortName,
                    flagUrl: stat.teamInfo.flagUrl,
                    averagePoints: avg,
                    count: stat.count
                };
            }
        }
    });

    // Points Timeline for last 15 finished matches
    const pointsTimeline = completedPredictions.slice(-15).map((p: any) => ({
        matchId: p.match._id.toString(),
        homeTeam: {
            name: p.match.homeTeam?.name,
            shortName: p.match.homeTeam?.shortName,
            flagUrl: p.match.homeTeam?.flagUrl
        },
        awayTeam: {
            name: p.match.awayTeam?.name,
            shortName: p.match.awayTeam?.shortName,
            flagUrl: p.match.awayTeam?.flagUrl
        },
        predictedScore: `${p.homeScore}-${p.awayScore}`,
        actualScore: `${p.match.homeScore}-${p.match.awayScore}`,
        points: p.points || 0,
        kickOff: p.match.kickOff
    }));

    return JSON.parse(
        JSON.stringify({
            userId,
            user: {
                name: session.user.name,
                nickname: (session.user as any).nickname,
                email: session.user.email,
                image: session.user.image
            },
            globalRank: rank,
            totalCompetitors: leaderboard.length,
            totalPoints,
            totalPredictionsMade,
            totalCompleted,
            averagePointsPerMatch,
            accuracyRate: totalCompleted > 0 ? (correctOutcomesCount / totalCompleted) * 100 : 0,
            exactScoreRate: totalCompleted > 0 ? (exactScoresCount / totalCompleted) * 100 : 0,
            pointsDistribution: {
                perfect: perfectCount,
                nearMiss: nearMissCount,
                scoreOnly: scoreOnlyCount,
                outcomeOnly: outcomeOnlyCount,
                zero: zeroPointsCount
            },
            goalStats: {
                totalPredictedGoals,
                totalActualGoals,
                averagePredictedGoals: totalCompleted > 0 ? totalPredictedGoals / totalCompleted : 0,
                averageActualGoals: totalCompleted > 0 ? totalActualGoals / totalCompleted : 0
            },
            mostPredictedScoreline,
            stageBreakdown,
            bestTeam,
            worstTeam,
            pointsTimeline
        })
    );
}
