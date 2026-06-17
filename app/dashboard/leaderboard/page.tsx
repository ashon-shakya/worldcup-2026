import { getGlobalLeaderboard } from "@/app/actions/leaderboard";
import { auth } from "@/auth";
import { Crown } from "lucide-react";
import GlobalLeaderboardView from "@/components/user/GlobalLeaderboardView";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
    const session = await auth();
    const currentUserId = session?.user?.id;
    const leaderboard = await getGlobalLeaderboard();

    return (
        <div className="space-y-6">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                    <Crown className="w-8 h-8 text-indigo-600" />
                    Global Leaderboard
                </h1>
                <p className="mt-2 text-gray-500">
                    See who is leading the prediction tournament!
                </p>
            </div>

            {leaderboard.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-550 max-w-4xl mx-auto">
                    No predictions yet. Be the first to predict!
                </div>
            ) : (
                <GlobalLeaderboardView leaderboard={leaderboard} currentUserId={currentUserId} />
            )}
        </div>
    );
}
