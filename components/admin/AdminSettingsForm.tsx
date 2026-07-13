"use client";

import {
  updatePointSettings,
  PointSettings,
} from "@/app/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { ALL_STAGES } from "@/lib/constants";

interface AdminSettingsFormProps {
  initialSettings: PointSettings;
}

export default function AdminSettingsForm({
  initialSettings,
}: AdminSettingsFormProps) {
  const initialState = {
    message: "",
    success: false,
  };

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const spStages = formData.getAll("spStages") as string[];
      const spStageEvents: Record<string, string[]> = {};
      ALL_STAGES.forEach((stage) => {
        spStageEvents[stage] = formData.getAll(`spEvents_${stage}`) as string[];
      });

      const settings: PointSettings = {
        correctScore: Number(formData.get("correctScore")),
        correctOutcome: Number(formData.get("correctOutcome")),
        correctPenaltyPrediction: Number(
          formData.get("correctPenaltyPrediction"),
        ),
        spStages,
        spStageEvents,
        spRedCardsCorrect: Number(formData.get("spRedCardsCorrect")),
        spRedCardsIncorrect: Number(formData.get("spRedCardsIncorrect")),
        spTotalCardsCorrect: Number(formData.get("spTotalCardsCorrect")),
        spTotalCardsIncorrect: Number(formData.get("spTotalCardsIncorrect")),
        spExtraTimeCorrect: Number(formData.get("spExtraTimeCorrect")),
        spExtraTimeIncorrect: Number(formData.get("spExtraTimeIncorrect")),
        spInGamePenaltyCorrect: Number(formData.get("spInGamePenaltyCorrect")),
        spInGamePenaltyIncorrect: Number(formData.get("spInGamePenaltyIncorrect")),
        spOwnGoalCorrect: Number(formData.get("spOwnGoalCorrect")),
        spOwnGoalIncorrect: Number(formData.get("spOwnGoalIncorrect")),
        spFirstTeamScoreCorrect: Number(formData.get("spFirstTeamScoreCorrect")),
        spFirstTeamScoreIncorrect: Number(formData.get("spFirstTeamScoreIncorrect")),
      };
      const result = await updatePointSettings(settings);
      if (result.message === "success") {
        return { message: "Settings updated successfully", success: true };
      }
      return {
        message: result.message || "Failed to update settings",
        success: false,
      };
    },
    initialState,
  );

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 max-w-2xl"
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Point System Configuration
        </h2>
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
              Points awarded for correctly predicting the exact home and away
              score.
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
              Points awarded for correctly predicting if a match will go to
              penalties (Knockout only).
            </p>
          </div>
        </div>
      </div>

      {/* Special Predictions Config */}
      <div className="border-t border-gray-150 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Special Predictions
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Enable or disable special event predictions for certain stages and define point structures.
        </p>

        {/* Enabled Stages & Events Matrix */}
        <div className="mb-6 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Enabled Stages & Events per Stage
          </label>
          <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Stage</th>
                  <th className="px-4 py-3 text-center font-bold">Category Active?</th>
                  <th className="px-4 py-3 text-center font-bold">Red Cards</th>
                  <th className="px-4 py-3 text-center font-bold">Total Cards</th>
                  <th className="px-4 py-3 text-center font-bold">Extra Time</th>
                  <th className="px-4 py-3 text-center font-bold">In-Game PK</th>
                  <th className="px-4 py-3 text-center font-bold">Own Goal</th>
                  <th className="px-4 py-3 text-center font-bold">1st Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
                {ALL_STAGES.map((stage) => {
                  const isStageChecked = initialSettings.spStages?.includes(stage) ?? true;
                  const enabledEvents = initialSettings.spStageEvents?.[stage] ?? [
                    "spRedCards",
                    "spTotalCards",
                    "spExtraTime",
                    "spInGamePenalty",
                    "spOwnGoal",
                    "spFirstTeamToScore"
                  ];

                  return (
                    <tr key={stage} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-800">{stage}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          name="spStages"
                          value={stage}
                          defaultChecked={isStageChecked}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                        />
                      </td>
                      {[
                        "spRedCards",
                        "spTotalCards",
                        "spExtraTime",
                        "spInGamePenalty",
                        "spOwnGoal",
                        "spFirstTeamToScore"
                      ].map((eventKey) => {
                        const isEventChecked = enabledEvents.includes(eventKey);
                        return (
                          <td key={eventKey} className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              name={`spEvents_${stage}`}
                              value={eventKey}
                              defaultChecked={isEventChecked}
                              className="h-3.5 w-3.5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Point Settings Grid */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Special Predictions Point Configuration
          </label>
          
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Special Prediction Event</th>
                  <th className="px-4 py-2 text-left font-semibold">Correct Points (+)</th>
                  <th className="px-4 py-2 text-left font-semibold">Incorrect Points (-)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
                {[
                  { label: "Red Cards (Yes/No)", prefix: "spRedCards", desc: "Predict if a red card will be shown in the match." },
                  { label: "Total Cards (Under 5 / 5 and over)", prefix: "spTotalCards", desc: "Predict total cards (yellow + red) count." },
                  { label: "Extra Time (Yes/No)", prefix: "spExtraTime", desc: "Predict if match goes to extra time." },
                  { label: "In Game Penalty (Yes/No)", prefix: "spInGamePenalty", desc: "Predict if a penalty is awarded during main play." },
                  { label: "Own Goal (Yes/No)", prefix: "spOwnGoal", desc: "Predict if an own goal is scored." },
                  { label: "First Team to Score (Team A/Team B)", prefix: "spFirstTeamScore", desc: "Predict which team scores the first goal." },
                ].map((item) => (
                  <tr key={item.prefix}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        name={`${item.prefix}Correct`}
                        defaultValue={(initialSettings as any)[`${item.prefix}Correct`] ?? 3}
                        min="0"
                        required
                        className="w-24 bg-white text-gray-900 border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        name={`${item.prefix}Incorrect`}
                        defaultValue={(initialSettings as any)[`${item.prefix}Incorrect`] ?? -2}
                        max="0"
                        required
                        className="w-24 bg-white text-gray-900 border-gray-300"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              try {
                setIsSending(true);
                const res = await fetch("/api/admin/send-match-emails", {
                  method: "POST",
                  credentials: "same-origin",
                  headers: { Accept: "application/json" },
                });

                const contentType = res.headers.get("content-type") || "";
                let json: any = null;
                if (contentType.includes("application/json")) {
                  try {
                    json = await res.json();
                  } catch (e) {
                    toast.error("Invalid JSON response from server");
                    return;
                  }
                } else {
                  const text = await res.text();
                  toast.error(
                    text || "Unexpected non-JSON response from server",
                  );
                  return;
                }

                if (json && json.ok) {
                  toast.success(
                    `Emails sent to ${json.result.sent} users (${json.result.matchesFound} matches)`,
                  );
                } else {
                  toast.error(json?.error || "Failed to send emails");
                }
              } catch (e: any) {
                toast.error(e?.message || "Failed to send emails");
              } finally {
                setIsSending(false);
              }
            }}
            disabled={isSending}
          >
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Match Emails Now
          </Button>
        </div>

        <div>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}
