"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch since theme is read from localStorage on client-side
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-9 w-9 rounded-lg border border-gray-200 dark:border-primary/20 bg-gray-50 dark:bg-card/30" />
        );
    }

    return (
        <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-card/50 dark:hover:bg-card border border-gray-200 dark:border-primary/20 text-gray-700 dark:text-primary transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm dark:shadow-cyan-500/10 cursor-pointer flex items-center justify-center focus:outline-none"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5 text-amber-500 animate-spin-slow" style={{ animationDuration: "10s" }} />
            ) : (
                <Moon className="h-5 w-5 text-indigo-600" />
            )}
        </button>
    );
}
