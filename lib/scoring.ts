export function calculatePoints(
    predictionHome: number,
    predictionAway: number,
    resultHome: number,
    resultAway: number
): number {
    let points = 0;

    // 5 points for correct home score
    if (predictionHome === resultHome) {
        points += 5;
    }

    // 5 points for correct away score
    if (predictionAway === resultAway) {
        points += 5;
    }

    // Determine outcomes
    // 1: Home Win, 0: Draw, -1: Away Win
    const predictionOutcome = Math.sign(predictionHome - predictionAway);
    const resultOutcome = Math.sign(resultHome - resultAway);

    // 3 points for correct outcome
    if (predictionOutcome === resultOutcome) {
        points += 3;
    }

    return points;
}
