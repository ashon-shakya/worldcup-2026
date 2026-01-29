"use client";

import { updatePointSettings, PointSettings } from "@/app/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

interface AdminSettingsFormProps {
    initialSettings: PointSettings;
}

export default function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
    const initialState = {
        message: "",
        success: false,
    };

    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        const settings: PointSettings = {
            correctScore: Number(formData.get("correctScore")),
            correctOutcome: Number(formData.get("correctOutcome")),
            correctPenaltyPrediction: Number(formData.get("correctPenaltyPrediction")),
        };
        const result = await updatePointSettings(settings);
        if (result.message === "success") {
            return { message: "Settings updated successfully", success: true };
        }
        return { message: result.message || "Failed to update settings", success: false };
    }, initialState);

    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <form action={formAction} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 max-w-2xl">
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Point System Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correct Score Points
                        </label>
                        <Input
                            type="number"
                            name="correctScore"
                            defaultValue={initialSettings.correctScore}
                            min="0"
                            required
                            className="bg-white text-gray-900 border-gray-300"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Points awarded for correctly predicting the exact home and away score.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correct Outcome Points
                        </label>
                        <Input
                            type="number"
                            name="correctOutcome"
                            defaultValue={initialSettings.correctOutcome}
                            min="0"
                            required
                            className="bg-white text-gray-900 border-gray-300"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Points awarded for correctly predicting the winner (or draw).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Penalty Prediction Points
                        </label>
                        <Input
                            type="number"
                            name="correctPenaltyPrediction"
                            defaultValue={initialSettings.correctPenaltyPrediction}
                            min="0"
                            required
                            className="bg-white text-gray-900 border-gray-300"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Points awarded for correctly predicting if a match will go to penalties (Knockout only).
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
