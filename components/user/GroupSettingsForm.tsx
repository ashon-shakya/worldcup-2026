"use client";

import { updateGroupStages } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import { Loader2, Settings } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface GroupSettingsFormProps {
    groupId: string;
    currentStages: string[];
}

export default function GroupSettingsForm({ groupId, currentStages }: GroupSettingsFormProps) {
    const validStages = ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "Final"];
    
    // Default to all stages if currentStages is empty or null
    const initialStages = currentStages && currentStages.length > 0 ? currentStages : validStages;
    const [selectedStages, setSelectedStages] = useState<string[]>(initialStages);
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

    const handleSave = () => {
        if (selectedStages.length === 0) {
            toast.error("You must include at least one round");
            return;
        }

        startTransition(async () => {
            const result = await updateGroupStages(groupId, selectedStages);
            if (result.message === "success") {
                toast.success("Scoring rounds settings updated successfully!");
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Configure Scoring Rounds
            </h2>
            <p className="text-xs text-gray-500">
                Select which rounds should contribute to the group's leaderboard points. 
                Rounds that are unchecked will be excluded from the group score calculation.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
                {validStages.map((stage) => {
                    const isChecked = selectedStages.includes(stage);
                    return (
                        <label
                            key={stage}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                                isChecked
                                    ? "bg-indigo-50/50 border-indigo-200 text-indigo-950 font-semibold"
                                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(stage)}
                                className="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-md transition-colors"
                            />
                            <span className="text-xs sm:text-sm">{stage}</span>
                        </label>
                    );
                })}
            </div>
            <div className="pt-2 flex justify-end">
                <Button onClick={handleSave} disabled={isPending} className="px-5 py-2 font-semibold">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
