import { getGlobalLeaderboard } from "@/app/actions/leaderboard";
import { auth } from "@/auth";
import { Trophy, Medal, Crown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
    const session = await auth();
    const currentUserId = session?.user?.id;
    const leaderboard = await getGlobalLeaderboard();

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
        if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
    };

    const getRankClass = (index: number) => {
        if (index === 0) return "bg-yellow-50 border-yellow-200";
        if (index === 1) return "bg-gray-50 border-gray-200";
        if (index === 2) return "bg-amber-50 border-orange-200";
        return "bg-white border-gray-100 hover:bg-gray-50";
    };

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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto">
                {leaderboard.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No predictions yet. Be the first to predict!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {leaderboard.map((user: any, index: number) => (
                            <div
                                key={user._id}
                                className={`flex items-center p-4 transition-colors ${getRankClass(index)} ${user._id === currentUserId ? "ring-2 ring-inset ring-indigo-500 z-10 relative" : ""}`}
                            >
                                <div className="flex-shrink-0 w-12 flex justify-center">
                                    {getRankIcon(index)}
                                </div>
                                <div className="flex-shrink-0 ml-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                        {user.name}
                                        {user._id === currentUserId && (
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">You</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Joined {new Date().getFullYear()}
                                    </div>
                                </div>
                                <div className="text-right px-4">
                                    <span className="block text-2xl font-bold text-indigo-600">{user.totalPoints}</span>
                                    <span className="text-xs font-medium text-gray-500 uppercase">Points</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
