import { User, Team, Match } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import { Users, Flag, Calendar } from "lucide-react";

async function getStats() {
    await connectToDatabase();
    const userCount = await User.countDocuments();
    const teamCount = await Team.countDocuments();
    const matchCount = await Match.countDocuments();

    return { userCount, teamCount, matchCount };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Users</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.userCount}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                {/* Team Stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Qualified Teams</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.teamCount}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                            <Flag size={24} />
                        </div>
                    </div>
                </div>

                {/* Match Stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Scheduled Matches</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.matchCount}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Calendar size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
