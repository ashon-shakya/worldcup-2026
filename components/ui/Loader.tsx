"use client";

import { useEffect, useState } from "react";

const LOADING_PHRASES = [
    "Preparing the pitch...",
    "Lacing up the boots...",
    "Tearing up the turf...",
    "Polishing the golden trophy...",
    "Inflating the match balls...",
    "Setting up the tactics board...",
    "Warming up the squads..."
];

interface LoaderProps {
    fullscreen?: boolean;
}

export default function Loader({ fullscreen = false }: LoaderProps) {
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
        }, 2200);
        return () => clearInterval(interval);
    }, []);

    const loaderContent = (
        <div className="flex flex-col items-center justify-center p-8 text-center select-none animate-in fade-in zoom-in duration-300">
            {/* Embedded styles for the custom rolling football and skid marks */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes ball-roll {
                    0% {
                        left: 0%;
                        transform: rotate(0deg);
                    }
                    48%, 52% {
                        left: calc(100% - 2.5rem);
                        transform: rotate(360deg);
                    }
                    100% {
                        left: 0%;
                        transform: rotate(0deg);
                    }
                }
                @keyframes skid-left {
                    0% {
                        width: 0%;
                        opacity: 0.9;
                    }
                    45% {
                        width: 100%;
                        opacity: 0.9;
                    }
                    48%, 100% {
                        width: 100%;
                        opacity: 0;
                    }
                }
                @keyframes skid-right {
                    0%, 48% {
                        width: 0%;
                        opacity: 0;
                    }
                    52% {
                        width: 0%;
                        opacity: 0.9;
                    }
                    95% {
                        width: 100%;
                        opacity: 0.9;
                    }
                    100% {
                        width: 100%;
                        opacity: 0;
                    }
                }
                .animate-ball {
                    position: absolute;
                    top: -0.75rem;
                    animation: ball-roll 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
                }
                .animate-skid-l {
                    animation: skid-left 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
                }
                .animate-skid-r {
                    animation: skid-right 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
                }
            `}} />

            {/* Main Animation Container */}
            <div className="w-64 h-16 relative flex items-center justify-center">
                {/* Grassy pitch track */}
                <div className="w-full h-3 bg-gradient-to-r from-emerald-800 via-green-600 to-emerald-700 rounded-full relative overflow-hidden border border-emerald-900/20 shadow-inner">
                    {/* Dark green grass stripes */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:24px_100%]" />
                    
                    {/* Left skid mark: dark grass/rubber tear */}
                    <div className="absolute left-0 top-0 h-full bg-slate-950/80 rounded-full animate-skid-l" style={{ width: 0 }} />
                    
                    {/* Right skid mark: dark grass/rubber tear */}
                    <div className="absolute right-0 top-0 h-full bg-slate-950/80 rounded-full animate-skid-r" style={{ width: 0 }} />
                </div>

                {/* Rolling Football SVG */}
                <div className="animate-ball w-10 h-10">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] select-none">
                        {/* Soccer ball base */}
                        <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
                        
                        {/* Central Pentagonal panel */}
                        <polygon points="50,34 65,45 59,63 41,63 35,45" fill="#1e293b" stroke="#1e293b" strokeWidth="2" />
                        
                        {/* Stitch lines pointing out to outer panels */}
                        <line x1="50" y1="34" x2="50" y2="12" stroke="#1e293b" strokeWidth="3" />
                        <line x1="65" y1="45" x2="87" y2="38" stroke="#1e293b" strokeWidth="3" />
                        <line x1="59" y1="63" x2="74" y2="85" stroke="#1e293b" strokeWidth="3" />
                        <line x1="41" y1="63" x2="26" y2="85" stroke="#1e293b" strokeWidth="3" />
                        <line x1="35" y1="45" x2="13" y2="38" stroke="#1e293b" strokeWidth="3" />
                        
                        {/* Outer panels */}
                        <path d="M 37 2 L 63 2 L 50 12 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="2" />
                        <path d="M 94 28 L 98 52 L 87 38 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="2" />
                        <path d="M 80 87 L 60 97 L 74 85 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="2" />
                        <path d="M 20 87 L 40 97 L 26 85 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="2" />
                        <path d="M 6 28 L 2 52 L 13 38 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="2" />
                    </svg>
                </div>
            </div>

            {/* Loading text with football sub-themes */}
            <div className="mt-4 flex flex-col items-center gap-1.5">
                <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-indigo-600 dark:from-emerald-400 dark:to-cyan-400 animate-pulse tracking-wide font-sans">
                    {LOADING_PHRASES[phraseIndex]}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase">
                    Loading Arena
                </div>
            </div>
        </div>
    );

    if (fullscreen) {
        return (
            <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-50/85 dark:bg-slate-950/85 backdrop-blur-md transition-all duration-300">
                <div className="p-8 bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-white/20 dark:border-slate-800/40 shadow-2xl backdrop-blur-xl">
                    {loaderContent}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[400px] flex items-center justify-center">
            {loaderContent}
        </div>
    );
}
