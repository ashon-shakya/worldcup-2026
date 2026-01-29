import { auth } from "@/auth";
import { getMatches } from "@/app/actions/admin/matches";
import { getUserPredictions } from "@/app/actions/predictions";
import MatchCard from "@/components/user/MatchCard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MatchesSchedulePage() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) redirect("/login");

    const matches = await getMatches();
    const userPredictions = await getUserPredictions(session.user.id);

    // Group matches by stage
    const matchesByStage: Record<string, any[]> = {};
    matches.forEach((match: any) => {
        if (!matchesByStage[match.stage]) {
            matchesByStage[match.stage] = [];
        }
        matchesByStage[match.stage].push(match);
    });

    const stagesOrder = ["Final", "Semi Final", "Quarter Final", "Round of 16", "Round of 32", "Group Stage"];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Match Schedule</h1>

            {stagesOrder.map(stage => {
                const stageMatches = matchesByStage[stage]?.sort((a, b) => new Date(a.kickOff).getTime() - new Date(b.kickOff).getTime());

                if (!stageMatches || stageMatches.length === 0) return null;

                return (
                    <div key={stage} className="mb-10">
                        <div className="flex items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">{stage}</h2>
                            <div className="ml-4 flex-1 h-px bg-gray-200"></div>
                        </div>

                        <div className="space-y-4">
                            {stageMatches.map(match => (
                                <MatchCard
                                    key={match._id}
                                    match={match}
                                    prediction={userPredictions[match._id]}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Fallback for stages not in order list or generic buckets */}
            {Object.keys(matchesByStage).filter(s => !stagesOrder.includes(s)).map(stage => (
                <div key={stage} className="mb-10">
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">{stage}</h2>
                        <div className="ml-4 flex-1 h-px bg-gray-200"></div>
                    </div>
                    <div className="space-y-4">
                        {matchesByStage[stage].sort((a, b) => new Date(a.kickOff).getTime() - new Date(b.kickOff).getTime()).map(match => (
                            <MatchCard
                                key={match._id}
                                match={match}
                                prediction={userPredictions[match._id]}
                            />
                        ))}
                    </div>
                </div>
            ))}

        </div>
    );
}
