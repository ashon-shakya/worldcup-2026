import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, Trophy, Settings, LogOut } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session || (role !== "ADMIN" && role !== "MODERATOR")) {
        console.log("Access denied. Redirecting to /");
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Sidebar */}
            <AdminSidebar role={role} />

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 md:ml-64 pt-20 md:pt-8">
                {children}
            </main>
        </div>
    );
}
