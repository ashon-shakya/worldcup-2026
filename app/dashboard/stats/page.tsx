import { getUserStatsPageData } from "@/app/actions/stats";
import UserStatsView from "@/components/user/UserStatsView";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
    const statsData = await getUserStatsPageData();

    return <UserStatsView stats={statsData} />;
}
