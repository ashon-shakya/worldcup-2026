import { getGroupDetails } from "@/app/actions/groups";
import { auth } from "@/auth";
import { Users } from "lucide-react";
import CopyButton from "@/components/user/CopyButton";
import DeleteGroupButton from "@/components/user/DeleteGroupButton";
import GroupDashboardView from "@/components/user/GroupDashboardView";
import GroupSettingsForm from "@/components/user/GroupSettingsForm";

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

            {/* Tabs View (Leaderboard & Match Predictions Table) */}
            <GroupDashboardView
                groupId={group._id}
                leaderboard={leaderboard}
                group={group}
                currentUserId={currentUserId}
            />

            {/* Settings Section - Admin Only */}
            {currentUserId === group.owner && (
                <GroupSettingsForm groupId={group._id} currentStages={group.includedStages || []} />
            )}
        </div>
    );
}
