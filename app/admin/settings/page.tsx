import { auth } from "@/auth";
import { getPointSettings } from "@/app/actions/admin/settings";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/");
    }

    const settings = await getPointSettings();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Configure global application settings and point values.
                </p>
            </div>

            <AdminSettingsForm initialSettings={settings} />
        </div>
    );
}
