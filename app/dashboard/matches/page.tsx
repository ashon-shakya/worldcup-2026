import { auth } from "@/auth";
import { getMatches } from "@/app/actions/admin/matches";
import { getUserPredictions } from "@/app/actions/predictions";
import PaginatedMatchList from "@/components/user/PaginatedMatchList";
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
    const extraStages = Object.keys(matchesByStage).filter(s => !stagesOrder.includes(s));

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Match Schedule</h1>
            <PaginatedMatchList
                matchesByStage={matchesByStage}
                stagesOrder={stagesOrder}
                extraStages={extraStages}
                userPredictions={userPredictions}
            />
        </div>
    );
}
