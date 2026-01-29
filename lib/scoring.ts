import { PointSettings } from "@/app/actions/admin/settings";

export function calculatePoints(
    predictionHome: number,
    predictionAway: number,
    resultHome: number,
    resultAway: number,
    settings: PointSettings,
    predictionPenalty?: boolean,
    resultWentToPenalties?: boolean,
    isKnockout?: boolean
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
        // Wait, if user said NO and it DIDN'T go to penalties, should they get points?
        // Usually "predicting penalties" means betting on the draw + extra time draw.
        // Let's stick to the explicit request: "predict if it will go to penalty or not"
        // This implies a binary choice.

        // However, we only have `resultWentToPenalties` passed here if it *did* go to penalties or if we track that boolean on the match.
        // The `updateMatchScore` action sets `status: FINISHED`. We added `wentToPenalties` to the match schema.

        // If the admin marks the match as `wentToPenalties = true`
        // And user predicted `predictedToGoToPenalties = true` -> Points
        // If admin marks `wentToPenalties = false`
        // And user predicted `predictedToGoToPenalties = false` -> Points?
        // The user prompt said "add rule if it is a knockout round, people can predict if it will go to penalty or not"
        // Usually bonus points are for predicting correctly.

        // Let's assume points are awarded if their boolean prediction matches the actual boolean outcome.
        if (predictionPenalty === resultWentToPenalties) {
            points += settings.correctPenaltyPrediction;
        }
    }

    return points;
}
