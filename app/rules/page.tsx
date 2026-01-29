import RulesContent from "@/components/RulesContent";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PublicRulesPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/login" className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </div>

                <RulesContent />
            </div>
        </div>
    );
}
