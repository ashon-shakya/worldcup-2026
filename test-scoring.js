
function calculatePoints(
    predictionHome,
    predictionAway,
    resultHome,
    resultAway
) {
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

function test(name, predictionHome, predictionAway, resultHome, resultAway, expectedPoints) {
    const points = calculatePoints(predictionHome, predictionAway, resultHome, resultAway);
    if (points === expectedPoints) {
        console.log(`[PASS] ${name}: Predicted ${predictionHome}-${predictionAway}, Result ${resultHome}-${resultAway} => ${points} pts`);
    } else {
        console.error(`[FAIL] ${name}: Predicted ${predictionHome}-${predictionAway}, Result ${resultHome}-${resultAway} => Expected ${expectedPoints}, got ${points}`);
    }
}

console.log("Running Points Calculation Tests...");

// Test Case 1: Exact Score (Home Win)
// 5 (Home) + 5 (Away) + 3 (Outcome) = 13
test("Exact Score (Home Win)", 2, 1, 2, 1, 13);

// Test Case 2: Exact Score (Draw)
// 5 + 5 + 3 = 13
test("Exact Score (Draw)", 1, 1, 1, 1, 13);

// Test Case 3: Correct Outcome (Home Win), Score Incorrect
// Home: Pred 2, Act 1 (0) | Away: Pred 0, Act 0 (5) | Outcome: Home Win (3) => 8
test("Correct Outcome (Home Win), Correct Away Score", 2, 0, 1, 0, 8);

// Test Case 4: Correct Outcome (Home Win), Both Scores Incorrect
// Home: Pred 3, Act 1 (0) | Away: Pred 1, Act 0 (0) | Outcome: Home Win (3) => 3
test("Correct Outcome Only", 3, 1, 1, 0, 3);

// Test Case 5: Incorrect Outcome
// Home: Pred 0, Act 1 (0) | Away: Pred 1, Act 0 (0) | Outcome: Loss vs Win (0) => 0
test("Incorrect Outcome", 0, 1, 1, 0, 0);

// Test Case 6: Correct Home Score Only (Outcome Wrong)
// Can happen? e.g. Pred 1-2, Result 1-3. Outcome is Away Win.
// Pred H=1, Act H=1 (5). Pred A=2, Act A=3 (0). Outcome Correct (Away Win) (3). => 8
test("Correct Home Score, Correct Outcome", 1, 2, 1, 3, 8);

// Test Case 7: Correct Home Score, Incorrect Outcome
// Pred 1-1 (Draw), Result 1-2 (Away Win).
// Pred H=1, Act H=1 (5). Pred A=1, Act A=2 (0). Outcome Wrong (0). => 5
test("Correct Home Score, Incorrect Outcome", 1, 1, 1, 2, 5);
