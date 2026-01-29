"use client";

import { getUserGroups } from "@/app/actions/groups";
import CreateGroupForm from "@/components/user/CreateGroupForm";
import JoinGroupForm from "@/components/user/JoinGroupForm";
import { Plus, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GroupsPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<"create" | "join" | null>(null);

    const fetchGroups = async () => {
        setIsLoading(true);
        const data = await getUserGroups();
        setGroups(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (!activeModal) {
            fetchGroups();
        }
    }, [activeModal]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Users className="mr-2 h-6 w-6 text-indigo-600" />
                        My Groups
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Create or join private leagues to compete with friends.
                    </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setActiveModal("join")}
                        className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Join Group
                    </button>
                    <button
                        onClick={() => setActiveModal("create")}
                        className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 font-medium transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Create Group
                    </button>
                </div>
            </div>

            {/* Modal Overlay */}
            {activeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                {activeModal === "create" ? "Create New Group" : "Join Existing Group"}
                            </h2>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                ✕
                            </button>
                        </div>
                        {activeModal === "create" ? (
                            <CreateGroupForm onClose={() => setActiveModal(null)} />
                        ) : (
                            <JoinGroupForm onClose={() => setActiveModal(null)} />
                        )}
                    </div>
                </div>
            )}

            {/* Groups List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading your groups...</div>
                ) : groups.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No groups yet</h3>
                        <p className="text-gray-500 mt-1">Create one or join a friend's group to get started!</p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <Link
                            key={group._id}
                            href={`/dashboard/groups/${group._id}`}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow hover:border-indigo-300 group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                                    {group.name.charAt(0).toUpperCase()}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${group.isPrivate ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}>
                                    {group.isPrivate ? "Private" : "Public"}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                {group.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <Users size={16} className="mr-1" />
                                {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                            </div>
                            <div className="flex items-center text-indigo-600 font-medium text-sm">
                                View Leaderboard <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
