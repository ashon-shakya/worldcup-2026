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
    actualWinnerId?: string
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

        return points;
    }

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
        // Checking if user correctly predicted that it WOULD go to penalties
        // The user request says: "people can predict if it will go to penalty or not"
        // So if user said YES (true), and it went to penalties (true), they get points.
        // If user said NO (false), and it went to penalties (true), they get 0.
        // Let's assume points are awarded if their boolean prediction matches the actual boolean outcome.
        if (predictionPenalty === resultWentToPenalties) {
            points += settings.correctPenaltyPrediction;
        }
    }

    return points;
}
