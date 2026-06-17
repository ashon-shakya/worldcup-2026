import { getGlobalLeaderboard } from "@/app/actions/leaderboard";
import { auth } from "@/auth";
import { Crown } from "lucide-react";
import LeaderboardRow from "@/components/user/LeaderboardRow";
import LeaderboardRace from "@/components/user/LeaderboardRace";

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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-500 max-w-4xl mx-auto">
                    No predictions yet. Be the first to predict!
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full">
                    {/* Leaderboard list: Left on desktop, Top on mobile */}
                    <div className="lg:col-span-5 space-y-3 w-full">
                        <div className="bg-white dark:bg-slate-900/60 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20">
                                <h2 className="font-semibold text-gray-900 dark:text-white">Leaderboard Standings</h2>
                            </div>
                            <div className="p-4 space-y-3">
                                {leaderboard.map((user: any, index: number) => (
                                    <LeaderboardRow
                                        key={user._id}
                                        user={user}
                                        index={index}
                                        currentUserId={currentUserId}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard race chart: Right on desktop, Bottom on mobile */}
                    <div className="lg:col-span-7 w-full">
                        <LeaderboardRace />
                    </div>
                </div>
            )}
        </div>
    );
}
