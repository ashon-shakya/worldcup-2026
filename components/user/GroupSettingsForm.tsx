"use client";

import { updateGroupSettings } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Palette, Eye, Users, ArrowRight, XCircle, Type } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface GroupSettingsFormProps {
    groupId: string;
    currentStages: string[];
    currentColor: string | null;
    currentTextColor: string | null;
    groupName: string;
}

const PASTEL_COLORS = [
    { hex: "#FFC5C5", name: "Soft Red" },
    { hex: "#FFE0C5", name: "Soft Orange" },
    { hex: "#FFEEC5", name: "Soft Apricot" },
    { hex: "#FFFCC5", name: "Soft Yellow" },
    { hex: "#D8F5C5", name: "Soft Lime" },
    { hex: "#C5F5D8", name: "Soft Green" },
    { hex: "#C5EDF5", name: "Soft Sky" },
    { hex: "#C5C5F5", name: "Periwinkle" },
    { hex: "#D8C5F5", name: "Soft Lavender" },
    { hex: "#FFC5EC", name: "Soft Rose" }
];

const ANIMATED_BACKGROUNDS = [
    { className: "bg-animate-1", name: "Sunset Glow" },
    { className: "bg-animate-2", name: "Electric Lavender" },
    { className: "bg-animate-3", name: "Peach Dream" },
    { className: "bg-animate-4", name: "Cotton Candy" },
    { className: "bg-animate-5", name: "Golden Hour" },
    { className: "bg-animate-6", name: "Ocean Breeze" },
    { className: "bg-animate-7", name: "Emerald Waves" },
    { className: "bg-animate-8", name: "Northern Lights" },
    { className: "bg-animate-9", name: "Soft Slate Animate" },
    { className: "bg-animate-10", name: "Mystic Forest" }
];

const TEXT_COLORS = [
    { hex: "#0f172a", name: "Slate" },
    { hex: "#1e1b4b", name: "Deep Indigo" },
    { hex: "#2e1065", name: "Deep Purple" },
    { hex: "#022c22", name: "Deep Green" },
    { hex: "#042f2e", name: "Deep Teal" },
    { hex: "#4c0519", name: "Deep Rose" },
    { hex: "#451a03", name: "Deep Amber" },
    { hex: "#172554", name: "Deep Blue" },
    { hex: "#2c1c09", name: "Deep Brown" },
    { hex: "#111827", name: "Jet Black" }
];

export default function GroupSettingsForm({ groupId, currentStages, currentColor, currentTextColor, groupName }: GroupSettingsFormProps) {
    const validStages = ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "Final"];
    
    // Default to all stages if currentStages is empty or null
    const initialStages = currentStages && currentStages.length > 0 ? currentStages : validStages;
    const [selectedStages, setSelectedStages] = useState<string[]>(initialStages);
    const [selectedColor, setSelectedColor] = useState<string | null>(currentColor);
    const [selectedTextColor, setSelectedTextColor] = useState<string | null>(currentTextColor);
    const [isPending, startTransition] = useTransition();

    const handleCheckboxChange = (stage: string) => {
        setSelectedStages((prev) => {
            if (prev.includes(stage)) {
                return prev.filter((s) => s !== stage);
            } else {
                return [...prev, stage];
            }
        });
    };

    const handleResetColors = () => {
        setSelectedColor(null);
        setSelectedTextColor(null);
    };

    const handleSave = () => {
        if (selectedStages.length === 0) {
            toast.error("You must include at least one round");
            return;
        }

        startTransition(async () => {
            const result = await updateGroupSettings(groupId, selectedStages, selectedColor, selectedTextColor);
            if (result.message === "success") {
                toast.success("Group settings updated successfully!");
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white dark:bg-slate-900/60 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            
            {/* Configure Scoring Rounds */}
            <div className="lg:col-span-2 space-y-5">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Configure Scoring Rounds
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Select which rounds should contribute to the group's leaderboard points. 
                        Rounds that are unchecked will be excluded from the group score calculation.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                    {validStages.map((stage) => {
                        const isChecked = selectedStages.includes(stage);
                        return (
                            <label
                                key={stage}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                                    isChecked
                                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 text-indigo-955 dark:text-indigo-200 font-semibold"
                                        : "bg-white dark:bg-slate-900/20 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleCheckboxChange(stage)}
                                    className="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-700 rounded-md transition-colors"
                                />
                                <span className="text-xs sm:text-sm">{stage}</span>
                            </label>
                        );
                    })}
                </div>

                {/* Primary Color Picker */}
                <div className="pt-4 space-y-4 border-t border-gray-100 dark:border-slate-800">
                    <div className="space-y-1">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            Group Primary Theme Background
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Select a primary theme background pastel color for this group card.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 pt-1">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Reset / Default button */}
                            <button
                                type="button"
                                onClick={handleResetColors}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                    selectedColor === null
                                        ? "bg-gray-100 dark:bg-slate-800 border-gray-400 dark:border-slate-600 text-gray-900 dark:text-white"
                                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                                }`}
                                title="Reset to default theme"
                            >
                                <XCircle size={14} className="text-red-500" />
                                Default Theme
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pastel Backgrounds */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Pastel Solid Colors</span>
                                <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-gray-50/50 dark:bg-slate-950/20 border border-gray-150 dark:border-slate-800 rounded-xl w-fit">
                                    {PASTEL_COLORS.map((color) => {
                                        const isSelected = selectedColor === color.hex;
                                        return (
                                            <button
                                                key={color.hex}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColor(color.hex);
                                                    // Set default dark text if color is set but text color is null
                                                    if (selectedTextColor === null) {
                                                        setSelectedTextColor("#0f172a");
                                                    }
                                                }}
                                                className={`w-6 h-6 rounded-full border transition-all duration-200 cursor-pointer ${
                                                    isSelected
                                                        ? "ring-2 ring-indigo-500 dark:ring-indigo-400 scale-110 border-white dark:border-slate-900"
                                                        : "border-black/5 dark:border-white/5 hover:scale-105"
                                                }`}
                                                style={{ backgroundColor: color.hex }}
                                                title={color.name}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Animated Backgrounds */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Animated Themes</span>
                                <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-gray-50/50 dark:bg-slate-950/20 border border-gray-150 dark:border-slate-800 rounded-xl w-fit">
                                    {ANIMATED_BACKGROUNDS.map((bg) => {
                                        const isSelected = selectedColor === bg.className;
                                        return (
                                            <button
                                                key={bg.className}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColor(bg.className);
                                                    // Set default dark text if color is set but text color is null
                                                    if (selectedTextColor === null) {
                                                        setSelectedTextColor("#0f172a");
                                                    }
                                                }}
                                                className={`w-6 h-6 rounded-full border transition-all duration-200 cursor-pointer ${bg.className} ${
                                                    isSelected
                                                        ? "ring-2 ring-indigo-500 dark:ring-indigo-400 scale-110 border-white dark:border-slate-900"
                                                        : "border-black/5 dark:border-white/5 hover:scale-105"
                                                }`}
                                                title={bg.name}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Text Color Picker */}
                {selectedColor && (
                    <div className="pt-4 space-y-3 border-t border-gray-100 dark:border-slate-800 animate-in fade-in duration-200">
                        <div className="space-y-1">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                Group Text Color
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Select a contrasting dark text color that displays nicely on top of your chosen pastel background.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <div className="grid grid-cols-10 gap-1.5 p-1.5 bg-gray-50/50 dark:bg-slate-950/20 border border-gray-150 dark:border-slate-800 rounded-xl">
                                {TEXT_COLORS.map((color) => {
                                    const isSelected = selectedTextColor === color.hex;
                                    return (
                                        <button
                                            key={color.hex}
                                            type="button"
                                            onClick={() => setSelectedTextColor(color.hex)}
                                            className={`w-6 h-6 rounded-full border transition-all duration-200 cursor-pointer ${
                                                isSelected
                                                    ? "ring-2 ring-indigo-500 dark:ring-indigo-400 scale-110 border-white dark:border-slate-900"
                                                    : "border-white/20 hover:scale-105"
                                            }`}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-2 flex justify-end border-t border-gray-100 dark:border-slate-800 pt-4">
                    <Button onClick={handleSave} disabled={isPending} className="px-5 py-2 font-semibold">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Preview Card Block */}
            <div className="border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-start space-y-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Eye size={16} className="text-gray-400" />
                        Live Card Preview
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        This is how your group's card will look in the dashboard list.
                    </p>
                </div>

                <div className="flex-1 flex items-center justify-center p-4 bg-gray-50/40 dark:bg-slate-950/10 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
                    <div 
                        className={`w-full rounded-xl shadow-xs border p-6 transition-all duration-200 group flex flex-col justify-between max-w-[260px] h-[175px] ${
                            selectedColor 
                                ? `border-black/10 shadow-md ${!selectedColor.startsWith("#") ? selectedColor : ""}` 
                                : "bg-white dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 hover:border-indigo-300"
                        }`}
                        style={selectedColor ? { 
                            ...(selectedColor.startsWith("#") ? { backgroundColor: selectedColor } : {}), 
                            color: selectedTextColor || "#0f172a" 
                        } : {}}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg ${selectedColor ? "bg-white/60 text-slate-900 border border-black/5" : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"}`}>
                                    {groupName.charAt(0).toUpperCase()}
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedColor ? "bg-black/10 text-slate-900 font-semibold" : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"}`}>
                                    Private
                                </span>
                            </div>
                            <h3 className={`text-base font-bold mb-0.5 line-clamp-1 ${selectedColor ? "text-current" : "text-gray-900 dark:text-white"}`}>
                                {groupName}
                            </h3>
                            <div className={`flex items-center text-xs ${selectedColor ? "text-current opacity-80" : "text-gray-500 dark:text-gray-400"}`}>
                                <Users size={14} className="mr-1" />
                                3 members
                            </div>
                        </div>
                        <div className={`flex items-center font-semibold text-xs mt-auto ${selectedColor ? "text-current border-t border-black/10 pt-2" : "text-indigo-600 dark:text-indigo-400"}`}>
                            View Leaderboard <ArrowRight size={14} className="ml-1" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
