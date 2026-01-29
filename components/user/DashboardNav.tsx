"use client";

import Link from "next/link";
import { LogOut, Trophy, Home, List, Menu, X, Users, BookOpen } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function DashboardNav({ user }: { user: any }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-indigo-600">WC2026</h1>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                            <Link
                                href="/dashboard/matches"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            >
                                <List className="w-4 h-4 mr-2" />
                                Matches
                            </Link>
                            <Link
                                href="/dashboard/groups"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Groups
                            </Link>
                            <Link
                                href="/dashboard/leaderboard"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            >
                                <Trophy className="w-4 h-4 mr-2" />
                                Global
                            </Link>
                            <Link
                                href="/dashboard/rules"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Rules
                            </Link>
                            {user.role === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-red-500 hover:text-red-700 hover:border-red-300"
                                >
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700 hidden md:block">
                                {user.name}
                            </span>
                            {user.image && (
                                <img className="h-8 w-8 rounded-full" src={user.image} alt="" />
                            )}
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            href="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/matches"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                        >
                            Matches
                        </Link>
                        <Link
                            href="/dashboard/groups"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                        >
                            Groups
                        </Link>
                        <Link
                            href="/dashboard/leaderboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                        >
                            Global Leaderboard
                        </Link>
                    </div>
                    <div className="pt-4 pb-4 border-t border-gray-200">
                        <div className="flex items-center px-4">
                            <div className="flex-shrink-0">
                                {user.image ? (
                                    <img className="h-10 w-10 rounded-full" src={user.image} alt="" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">{user.name?.charAt(0)}</div>
                                )}
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="ml-auto flex-shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <LogOut className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

