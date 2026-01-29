import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, Trophy, Settings, LogOut } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    // console.log("Admin Layout Session:", JSON.stringify(session, null, 2));

    if (!session || (session.user as any).role !== "ADMIN") {
        console.log("Access denied. Redirecting to /");
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-40">
                <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                    <img src="/icon.png" alt="CupQuest Logo" className="h-8 w-auto rounded-md" />
                    <h1 className="text-xl font-bold">CupQuest Admin</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/admin/teams"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Users size={20} />
                        <span>Teams</span>
                    </Link>

                    <Link
                        href="/admin/matches"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Trophy size={20} />
                        <span>Matches</span>
                    </Link>

                    <Link
                        href="/admin/users"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Link
                        href="/"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                    >
                        <LogOut size={20} />
                        <span>Exit Admin</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
