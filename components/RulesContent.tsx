import { Trophy, Clock, Target, Shield, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RulesContent() {
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <Link href="/">
                <img className="mx-auto h-20 w-auto rounded-xl  mb-2 hover:opacity-80 transition-opacity" src="/icon.png" alt="CupQuest" />
            </Link>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">How to Play</h1>
                <p className="mt-2 text-gray-500">Master the rules and climb the leaderboard.</p>
            </div>

            {/* Scoring System */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <Trophy className="mr-2" />
                        Scoring System
                    </h2>
                </div>
                <div className="p-6 space-y-6 text-gray-900">
                    <p className="text-gray-600">
                        You can earn up to <span className="font-bold text-indigo-600">16 points</span> per match (in knockout rounds). Points are awarded based on accuracy:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="font-bold text-green-700 text-lg mb-1">5 Points</div>
                            <div className="text-sm text-green-800 font-medium">Correct Home Score</div>
                            <p className="text-xs text-green-600 mt-1">Predicting the exact goals scored by Home Team.</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="font-bold text-green-700 text-lg mb-1">5 Points</div>
                            <div className="text-sm text-green-800 font-medium">Correct Away Score</div>
                            <p className="text-xs text-green-600 mt-1">Predicting the exact goals scored by Away Team.</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="font-bold text-blue-700 text-lg mb-1">3 Points</div>
                            <div className="text-sm text-blue-800 font-medium">Correct Outcome</div>
                            <p className="text-xs text-blue-600 mt-1">Predicting the winner or a draw correctly.</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <div className="font-bold text-purple-700 text-lg mb-1">3 Points</div>
                            <div className="text-sm text-purple-800 font-medium">Penalty Bonus</div>
                            <p className="text-xs text-purple-600 mt-1">Correctly predicting if a knockout match goes to penalties.</p>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                            <Target className="mr-2 w-5 h-5 text-indigo-500" />
                            Examples
                        </h3>
                        <div className="space-y-3 text-sm text-black">
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <div>
                                    <span className="font-mono font-bold">Prediction: 2-1</span> vs <span className="font-mono font-bold">Result: 2-1</span>
                                </div>
                                <span className="font-bold text-indigo-600">13 Pts (Perfect Score + Outcome)</span>
                            </div>

                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <div>
                                    <span className="font-mono font-bold">Prediction: 2-0</span> vs <span className="font-mono font-bold">Result: 1-0</span>
                                </div>
                                <span className="font-bold text-indigo-600">8 Pts (Outcome + Away Score)</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <div>
                                    <span className="font-mono font-bold">Prediction: 3-0</span> vs <span className="font-mono font-bold">Result: 1-0</span>
                                </div>
                                <span className="font-bold text-indigo-600">8 Pts (Outcome + Away Score)</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <div>
                                    <span className="font-mono font-bold">Prediction: 1-1</span> vs <span className="font-mono font-bold">Result: 2-2</span>
                                </div>
                                <span className="font-bold text-indigo-600">3 Pts (Draw Outcome Only)</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <div>
                                    <span className="font-mono font-bold">Prediction: 1-0</span> vs <span className="font-mono font-bold">Result: 0-1</span>
                                </div>
                                <span className="font-bold text-gray-400">0 Pts</span>
                            </div>
                            <div className="flex justify-between items-center bg-purple-50 p-3 rounded">
                                <div>
                                    <span className="font-mono font-bold">Penalty Prediction: Yes</span> vs <span className="font-mono font-bold">Result: Yes</span>
                                </div>
                                <span className="font-bold text-purple-600">+3 Pts (Penalty Bonus)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rules & Deadlines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                        <Clock className="mr-2 text-orange-500" />
                        Deadlines
                    </h3>
                    <ul className="space-y-3 text-gray-600 text-sm">
                        <li className="flex items-start">
                            <span className="mr-2 text-orange-500">•</span>
                            Predictions lock <strong>5 minutes before kick-off</strong>.
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 text-orange-500">•</span>
                            Once a match starts, you cannot change your prediction.
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 text-orange-500">•</span>
                            Server time is used as the official time source.
                        </li>
                    </ul>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                        <Shield className="mr-2 text-blue-500" />
                        Leagues & Groups
                    </h3>
                    <ul className="space-y-3 text-gray-600 text-sm">
                        <li className="flex items-start">
                            <span className="mr-2 text-blue-500">•</span>
                            <strong>Global Leaderboard:</strong> Everyone competes here.
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 text-blue-500">•</span>
                            <strong>Private Groups:</strong> Create a group and share the code with friends to compete in a private league.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="text-center pt-8">
                <p className="text-gray-400 text-xs">
                    * Rules are subject to change before the tournament starts.
                </p>
            </div>
        </div>
    );
}
