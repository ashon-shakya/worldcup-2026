"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Trophy, Settings, LogOut, Menu, X } from "lucide-react";

export default function AdminSidebar({ role }: { role?: string }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = role === "MODERATOR"
        ? [
            { href: "/admin/set-score", label: "Set Score", icon: Trophy },
          ]
        : [
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/teams", label: "Teams", icon: Users },
            { href: "/admin/matches", label: "Matches", icon: Trophy },
            { href: "/admin/users", label: "Users", icon: Users },
            { href: "/admin/settings", label: "Settings", icon: Settings },
            { href: "/admin/set-score", label: "Set Score", icon: Trophy },
          ];

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Top mobile navigation header bar */}
            <header className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-md">
                <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="CupQuest Logo" className="h-8 w-auto rounded-md" />
                    <span className="font-bold text-lg">CupQuest Admin</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-400 hover:text-white focus:outline-none"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar backdrop overlay for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-45"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Aside Drawer/Sidebar */}
            <aside
                className={`w-64 bg-gray-900 text-white flex flex-col fixed h-full z-50 transform md:transform-none md:translate-x-0 transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } pt-16 md:pt-0`}
            >
                <div className="hidden md:flex p-6 border-b border-gray-800 items-center gap-3">
                    <img src="/icon.png" alt="CupQuest Logo" className="h-8 w-auto rounded-md" />
                    <h1 className="text-xl font-bold">CupQuest Admin</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    active
                                        ? "bg-indigo-600 text-white font-medium"
                                        : "hover:bg-gray-800 text-gray-300 hover:text-white"
                                }`}
                            >
                                <Icon size={20} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
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
        </>
    );
}
