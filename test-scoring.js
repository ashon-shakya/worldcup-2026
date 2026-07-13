
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
    actualWinnerId,
    stage,
    predictionSpecial,
    actualSpecial
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
    const isEventEnabled = (stage, eventKey) => {
        if (!stage || !eventKey || !settings) return false;
        const spStages = settings.spStages || [];
        if (!spStages.includes(stage)) return false;

        const spStageEvents = settings.spStageEvents;
        if (spStageEvents && spStageEvents[stage]) {
            return spStageEvents[stage].includes(eventKey);
        }
        return true; // default to enabled if stage is enabled
    };

    if (stage && predictionSpecial && actualSpecial) {
        // Red Cards
        if (isEventEnabled(stage, "spRedCards") && predictionSpecial.spRedCards !== undefined && predictionSpecial.spRedCards !== null) {
            if (predictionSpecial.spRedCards === actualSpecial.spRedCards) {
                points += (settings.spRedCardsCorrect ?? 3);
            } else {
                points += (settings.spRedCardsIncorrect ?? -2);
            }
        }
        // Total Cards
        if (isEventEnabled(stage, "spTotalCards") && predictionSpecial.spTotalCards !== undefined && predictionSpecial.spTotalCards !== null && predictionSpecial.spTotalCards !== "") {
            if (predictionSpecial.spTotalCards === actualSpecial.spTotalCards) {
                points += (settings.spTotalCardsCorrect ?? 3);
            } else {
                points += (settings.spTotalCardsIncorrect ?? -2);
            }
        }
        // Extra Time
        if (isEventEnabled(stage, "spExtraTime") && predictionSpecial.spExtraTime !== undefined && predictionSpecial.spExtraTime !== null) {
            if (predictionSpecial.spExtraTime === actualSpecial.spExtraTime) {
                points += (settings.spExtraTimeCorrect ?? 3);
            } else {
                points += (settings.spExtraTimeIncorrect ?? -2);
            }
        }
        // In Game Penalty
        if (isEventEnabled(stage, "spInGamePenalty") && predictionSpecial.spInGamePenalty !== undefined && predictionSpecial.spInGamePenalty !== null) {
            if (predictionSpecial.spInGamePenalty === actualSpecial.spInGamePenalty) {
                points += (settings.spInGamePenaltyCorrect ?? 3);
            } else {
                points += (settings.spInGamePenaltyIncorrect ?? -2);
            }
        }
        // Own Goal
        if (isEventEnabled(stage, "spOwnGoal") && predictionSpecial.spOwnGoal !== undefined && predictionSpecial.spOwnGoal !== null) {
            if (predictionSpecial.spOwnGoal === actualSpecial.spOwnGoal) {
                points += (settings.spOwnGoalCorrect ?? 3);
            } else {
                points += (settings.spOwnGoalIncorrect ?? -2);
            }
        }
        // First Team to Score
        if (isEventEnabled(stage, "spFirstTeamToScore") && predictionSpecial.spFirstTeamToScore !== undefined && predictionSpecial.spFirstTeamToScore !== null && predictionSpecial.spFirstTeamToScore !== "") {
            const predTeam = predictionSpecial.spFirstTeamToScore.toString();
            const actualTeam = actualSpecial.spFirstTeamToScore?.toString();
            if (actualTeam && predTeam === actualTeam) {
                points += (settings.spFirstTeamScoreCorrect ?? 3);
            } else {
                points += (settings.spFirstTeamScoreIncorrect ?? -2);
            }
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
    stage,
    predictionSpecial,
    actualSpecial,
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
        actualWinnerId,
        stage,
        predictionSpecial,
        actualSpecial
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
test("Exact Score (Home Win)", 2, 1, 2, 1, settings, false, false, false, null, null, null, null, null, 13);

// Test Case 2: Knockout Draw, Penalty shootout, Correct Winner
test("Knockout Draw, Penalty shootout, Correct Winner", 1, 1, 1, 1, settings, true, true, true, "teamA", "teamA", null, null, null, 16);

// Test Case 3: Knockout Draw, Penalty shootout, Incorrect Winner
test("Knockout Draw, Penalty shootout, Incorrect Winner", 1, 1, 1, 1, settings, true, true, true, "teamA", "teamB", null, null, null, 13);

// Test Case 4: Knockout Draw, Different Draw Score, Penalty shootout, Correct Winner
test("Knockout Draw, Different Draw Score, Penalty shootout, Correct Winner", 1, 1, 2, 2, settings, true, true, true, "teamA", "teamA", null, null, null, 6);

// Test Case 5: Knockout Draw, Different Draw Score, Penalty shootout, Incorrect Winner
test("Knockout Draw, Different Draw Score, Penalty shootout, Incorrect Winner", 1, 1, 2, 2, settings, true, true, true, "teamA", "teamB", null, null, null, 3);

// Test Case 6: Knockout Draw Prediction, but home team wins in regular/extra time
test("Knockout Draw Prediction, but home team wins in regular/extra time", 1, 1, 2, 1, settings, true, false, true, "teamA", "teamA", null, null, null, 5);

// Test Case 7: Knockout Home Win prediction, match goes to penalties
test("Knockout Home Win prediction, match goes to penalties", 2, 1, 1, 1, settings, false, true, true, null, "teamA", null, null, null, 5);

// Test Case 8: Knockout Home Win prediction, match ends in home win
test("Knockout Home Win prediction, match ends in home win", 2, 1, 2, 1, settings, false, false, true, null, "teamA", null, null, null, 13);

// Test Case 9: Group stage draw
test("Group stage draw", 1, 1, 1, 1, settings, false, false, false, null, null, null, null, null, 13);

// Test Case 10: Group stage draw mismatch
test("Group stage draw mismatch", 1, 1, 2, 2, settings, false, false, false, null, null, null, null, null, 3);

// Test Case 11: Special predictions enabled, correct guesses
const settingsWithSp = {
    correctScore: 5,
    correctOutcome: 3,
    correctPenaltyPrediction: 3,
    spStages: ["Final"],
    spRedCardsCorrect: 3,
    spRedCardsIncorrect: -2,
    spTotalCardsCorrect: 3,
    spTotalCardsIncorrect: -2,
};
test(
    "Special predictions correct guesses",
    2, 1, 2, 1, // predict 2-1, result 2-1 (13 pts)
    settingsWithSp,
    false, false, false, null, null,
    "Final",
    { spRedCards: true, spTotalCards: "UNDER" },
    { spRedCards: true, spTotalCards: "UNDER" },
    19 // 13 + 3 + 3 = 19
);

// Test Case 12: Special predictions enabled, incorrect guesses (negative marking)
test(
    "Special predictions incorrect guesses (negative marking)",
    2, 1, 2, 1, // predict 2-1, result 2-1 (13 pts)
    settingsWithSp,
    false, false, false, null, null,
    "Final",
    { spRedCards: true, spTotalCards: "OVER" },
    { spRedCards: false, spTotalCards: "UNDER" },
    9 // 13 - 2 - 2 = 9
);

// Test Case 13: Special predictions disabled for stage
test(
    "Special predictions disabled for stage (no points change)",
    2, 1, 2, 1, // predict 2-1, result 2-1 (13 pts)
    settingsWithSp,
    false, false, false, null, null,
    "Group Stage", // Final is enabled, Group Stage is disabled
    { spRedCards: true, spTotalCards: "UNDER" },
    { spRedCards: true, spTotalCards: "UNDER" },
    13 // 13 (no special prediction points since stage is disabled)
);

// Test Case 14: Special predictions enabled, but red cards event disabled specifically in spStageEvents settings
const settingsWithSpEvents = {
    correctScore: 5,
    correctOutcome: 3,
    correctPenaltyPrediction: 3,
    spStages: ["Final"],
    spStageEvents: {
        "Final": ["spTotalCards"] // red cards disabled
    },
    spRedCardsCorrect: 3,
    spRedCardsIncorrect: -2,
    spTotalCardsCorrect: 3,
    spTotalCardsIncorrect: -2,
};
test(
    "Special predictions with specific spRedCards event disabled in settings",
    2, 1, 2, 1, // predict 2-1, result 2-1 (13 pts)
    settingsWithSpEvents,
    false, false, false, null, null,
    "Final",
    { spRedCards: true, spTotalCards: "UNDER" },
    { spRedCards: true, spTotalCards: "UNDER" },
    16 // 13 (match) + 3 (total cards) + 0 (red cards because disabled) = 16
);

console.log("Tests complete.");
