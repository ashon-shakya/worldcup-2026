import { auth } from "@/auth";
import SettingsForm from "@/components/user/SettingsForm";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your profile information and security settings.
                </p>
            </div>

            <SettingsForm
                user={{
                    name: session.user.name || "",
                    email: session.user.email || "",
                    image: session.user.image,
                }}
            />
        </div>
    );
}
