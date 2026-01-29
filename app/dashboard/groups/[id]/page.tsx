import { getGroupDetails } from "@/app/actions/groups";
import { auth } from "@/auth";
import { Trophy, Users, Copy, Check } from "lucide-react";
import CopyButton from "@/components/user/CopyButton"; // We'll create this small helper
import DeleteGroupButton from "@/components/user/DeleteGroupButton";

export const dynamic = "force-dynamic";

export default async function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    const data = await getGroupDetails(id);

    if (!data) {
        return <div className="p-8 text-center text-red-500">Group not found or you don't have access.</div>;
    }

    const { group, leaderboard } = data;

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (index === 1) return <span className="text-gray-400 font-bold text-lg">2</span>;
        if (index === 2) return <span className="text-amber-600 font-bold text-lg">3</span>;
        return <span className="text-gray-500 font-bold">{index + 1}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header with Group Info & Invite Code */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm">
                            {group.name.charAt(0).toUpperCase()}
                        </div>
                        {group.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <Users size={14} className="mr-1" />
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3">
                    <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold mb-1 block text-right">Invite Code</span>
                        <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-lg font-mono font-bold tracking-wider text-gray-800 border border-gray-200">
                                {group.code}
                            </code>
                            <CopyButton text={group.code} />
                        </div>
                    </div>
                    {currentUserId === group.owner && (
                        <DeleteGroupButton groupId={group._id} />
                    )}
                </div>
            </div>

            {/* Leaderboard Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-900">Leaderboard</h2>
                </div>

                {leaderboard.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No members yet.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {leaderboard.map((user: any, index: number) => (
                            <div
                                key={user._id}
                                className={`flex items-center px-6 py-4 transition-colors hover:bg-gray-50 ${user._id === currentUserId ? "bg-indigo-50/50" : ""}`}
                            >
                                <div className="flex-shrink-0 w-8 flex justify-center text-center">
                                    {getRankIcon(index)}
                                </div>
                                <div className="flex-shrink-0 ml-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-200 text-gray-500 font-semibold">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                        {user.name}
                                        {user._id === currentUserId && (
                                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide">You</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xl font-bold text-indigo-600">{user.totalPoints}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
