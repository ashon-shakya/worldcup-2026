import { PointSettings } from "@/app/actions/admin/settings";

export function calculatePoints(
    predictionHome: number,
    predictionAway: number,
    resultHome: number,
    resultAway: number,
    settings: PointSettings,
    predictionPenalty?: boolean,
    resultWentToPenalties?: boolean,
    isKnockout?: boolean,
    predictedWinnerId?: string,
    actualWinnerId?: string,
    stage?: string,
    predictionSpecial?: {
        spRedCards?: boolean | null;
        spTotalCards?: string | null;
        spExtraTime?: boolean | null;
        spInGamePenalty?: boolean | null;
        spOwnGoal?: boolean | null;
        spFirstTeamToScore?: string | null;
    },
    actualSpecial?: {
        spRedCards?: boolean | null;
        spTotalCards?: string | null;
        spExtraTime?: boolean | null;
        spInGamePenalty?: boolean | null;
        spOwnGoal?: boolean | null;
        spFirstTeamToScore?: string | null;
    }
): number {
    let points = 0;

    // Correct home score
    if (predictionHome === resultHome) {
        points += settings.correctScore;
    }

    // Correct away score
    if (predictionAway === resultAway) {
        points += settings.correctScore;
    }

    // Special logic for knockout matches where the user predicts penalties (i.e. predicts a draw)
    let outcomePointsCalculated = false;
    if (isKnockout && predictionHome === predictionAway) {
        const predictedWinnerStr = predictedWinnerId?.toString();
        const actualWinnerStr = actualWinnerId?.toString();

        // In a knockout round if a user predicts penalty and predicts the correct winner
        // then the user gets penalty +3 (correctPenaltyPrediction) plus winner +3 (correctOutcome)
        // otherwise they will only get goal prediction points and not the penalty prediction score or outcome points.
        if (resultWentToPenalties && predictedWinnerStr && actualWinnerStr) {
            points += settings.correctPenaltyPrediction;
            if (predictedWinnerStr === actualWinnerStr) {
                points += settings.correctOutcome;
            }
        }
        outcomePointsCalculated = true;
    }

    if (!outcomePointsCalculated) {
        // Default flow (for group stage, or knockout matches where the user did NOT predict a draw/penalty)
        // Determine outcomes
        // 1: Home Win, 0: Draw, -1: Away Win
        const predictionOutcome = Math.sign(predictionHome - predictionAway);
        const resultOutcome = Math.sign(resultHome - resultAway);

        // Correct outcome
        if (predictionOutcome === resultOutcome) {
            points += settings.correctOutcome;
        }

        // Penalty prediction (only if match actually went to penalties)
        if (resultWentToPenalties && predictionPenalty !== undefined && predictionPenalty !== null) {
            if (predictionPenalty === resultWentToPenalties) {
                points += settings.correctPenaltyPrediction;
            }
        }
    }

    // Special Predictions scoring logic (category: "Special Predictions")
    points += calculateSpecialPoints(stage, predictionSpecial, actualSpecial, settings);

    return points;
}

export function isEventEnabled(stage?: string, eventKey?: string, settings?: any): boolean {
    if (!stage || !eventKey || !settings) return false;
    const spStages = settings.spStages || [];
    if (!spStages.includes(stage)) return false;

    const spStageEvents = settings.spStageEvents;
    if (spStageEvents && spStageEvents[stage]) {
        return spStageEvents[stage].includes(eventKey);
    }
    return true; // default to enabled if stage is enabled
}

export function calculateSpecialPoints(
    stage?: string,
    predictionSpecial?: {
        spRedCards?: boolean | null;
        spTotalCards?: string | null;
        spExtraTime?: boolean | null;
        spInGamePenalty?: boolean | null;
        spOwnGoal?: boolean | null;
        spFirstTeamToScore?: string | null;
    },
    actualSpecial?: {
        spRedCards?: boolean | null;
        spTotalCards?: string | null;
        spExtraTime?: boolean | null;
        spInGamePenalty?: boolean | null;
        spOwnGoal?: boolean | null;
        spFirstTeamToScore?: string | null;
    },
    settings?: PointSettings
): number {
    let points = 0;
    if (!stage || !settings || !predictionSpecial || !actualSpecial) return 0;

    // Red Cards
    if (isEventEnabled(stage, "spRedCards", settings) && predictionSpecial.spRedCards !== undefined && predictionSpecial.spRedCards !== null) {
        if (predictionSpecial.spRedCards === actualSpecial.spRedCards) {
            points += (settings.spRedCardsCorrect ?? 3);
        } else {
            points += (settings.spRedCardsIncorrect ?? -2);
        }
    }
    // Total Cards
    if (isEventEnabled(stage, "spTotalCards", settings) && predictionSpecial.spTotalCards !== undefined && predictionSpecial.spTotalCards !== null && predictionSpecial.spTotalCards !== "") {
        if (predictionSpecial.spTotalCards === actualSpecial.spTotalCards) {
            points += (settings.spTotalCardsCorrect ?? 3);
        } else {
            points += (settings.spTotalCardsIncorrect ?? -2);
        }
    }
    // Extra Time
    if (isEventEnabled(stage, "spExtraTime", settings) && predictionSpecial.spExtraTime !== undefined && predictionSpecial.spExtraTime !== null) {
        if (predictionSpecial.spExtraTime === actualSpecial.spExtraTime) {
            points += (settings.spExtraTimeCorrect ?? 3);
        } else {
            points += (settings.spExtraTimeIncorrect ?? -2);
        }
    }
    // In Game Penalty
    if (isEventEnabled(stage, "spInGamePenalty", settings) && predictionSpecial.spInGamePenalty !== undefined && predictionSpecial.spInGamePenalty !== null) {
        if (predictionSpecial.spInGamePenalty === actualSpecial.spInGamePenalty) {
            points += (settings.spInGamePenaltyCorrect ?? 3);
        } else {
            points += (settings.spInGamePenaltyIncorrect ?? -2);
        }
    }
    // Own Goal
    if (isEventEnabled(stage, "spOwnGoal", settings) && predictionSpecial.spOwnGoal !== undefined && predictionSpecial.spOwnGoal !== null) {
        if (predictionSpecial.spOwnGoal === actualSpecial.spOwnGoal) {
            points += (settings.spOwnGoalCorrect ?? 3);
        } else {
            points += (settings.spOwnGoalIncorrect ?? -2);
        }
    }
    // First Team to Score
    if (isEventEnabled(stage, "spFirstTeamToScore", settings) && predictionSpecial.spFirstTeamToScore !== undefined && predictionSpecial.spFirstTeamToScore !== null && predictionSpecial.spFirstTeamToScore !== "") {
        const predTeam = predictionSpecial.spFirstTeamToScore.toString();
        const actualTeam = actualSpecial.spFirstTeamToScore?.toString();
        if (actualTeam && predTeam === actualTeam) {
            points += (settings.spFirstTeamScoreCorrect ?? 3);
        } else {
            points += (settings.spFirstTeamScoreIncorrect ?? -2);
        }
    }

    return points;
}
