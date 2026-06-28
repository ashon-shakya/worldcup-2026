
function calculatePoints(
    predictionHome,
    predictionAway,
    resultHome,
    resultAway,
    settings,
    predictionPenalty,
    resultWentToPenalties,
    isKnockout,
    predictedWinnerId,
    actualWinnerId
) {
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
        if (resultWentToPenalties && predictedWinnerStr && actualWinnerStr && predictedWinnerStr === actualWinnerStr) {
            points += settings.correctPenaltyPrediction;
            points += settings.correctOutcome;
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
        if (predictionPenalty === resultWentToPenalties) {
            points += settings.correctPenaltyPrediction;
        }
    }

    return points;
}

function test(
    name,
    predictionHome,
    predictionAway,
    resultHome,
    resultAway,
    settings,
    predictionPenalty,
    resultWentToPenalties,
    isKnockout,
    predictedWinnerId,
    actualWinnerId,
    expectedPoints
) {
    const points = calculatePoints(
        predictionHome,
        predictionAway,
        resultHome,
        resultAway,
        settings,
        predictionPenalty,
        resultWentToPenalties,
        isKnockout,
        predictedWinnerId,
        actualWinnerId
    );
    if (points === expectedPoints) {
        console.log(`[PASS] ${name} => ${points} pts`);
    } else {
        console.error(`[FAIL] ${name} => Expected ${expectedPoints}, got ${points}`);
        process.exitCode = 1;
    }
}

const settings = {
    correctScore: 5,
    correctOutcome: 3,
    correctPenaltyPrediction: 3,
};

console.log("Running Points Calculation Tests...");

// Test Case 1: Exact Score (Home Win)
test("Exact Score (Home Win)", 2, 1, 2, 1, settings, false, false, false, null, null, 13);

// Test Case 2: Knockout Draw, Penalty shootout, Correct Winner
test("Knockout Draw, Penalty shootout, Correct Winner", 1, 1, 1, 1, settings, true, true, true, "teamA", "teamA", 16);

// Test Case 3: Knockout Draw, Penalty shootout, Incorrect Winner
test("Knockout Draw, Penalty shootout, Incorrect Winner", 1, 1, 1, 1, settings, true, true, true, "teamA", "teamB", 10);

// Test Case 4: Knockout Draw, Different Draw Score, Penalty shootout, Correct Winner
test("Knockout Draw, Different Draw Score, Penalty shootout, Correct Winner", 1, 1, 2, 2, settings, true, true, true, "teamA", "teamA", 6);

// Test Case 5: Knockout Draw, Different Draw Score, Penalty shootout, Incorrect Winner
test("Knockout Draw, Different Draw Score, Penalty shootout, Incorrect Winner", 1, 1, 2, 2, settings, true, true, true, "teamA", "teamB", 0);

// Test Case 6: Knockout Draw Prediction, but home team wins in regular/extra time
test("Knockout Draw Prediction, but home team wins in regular/extra time", 1, 1, 2, 1, settings, true, false, true, "teamA", "teamA", 5);

// Test Case 7: Knockout Home Win prediction, match goes to penalties
test("Knockout Home Win prediction, match goes to penalties", 2, 1, 1, 1, settings, false, true, true, null, "teamA", 5);

// Test Case 8: Knockout Home Win prediction, match ends in home win
test("Knockout Home Win prediction, match ends in home win", 2, 1, 2, 1, settings, false, false, true, null, "teamA", 13);

// Test Case 9: Group stage draw
test("Group stage draw", 1, 1, 1, 1, settings, false, false, false, null, null, 13);

// Test Case 10: Group stage draw mismatch
test("Group stage draw mismatch", 1, 1, 2, 2, settings, false, false, false, null, null, 3);

console.log("Tests complete.");
