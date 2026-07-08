import { getUserStatsPageData } from "@/app/actions/stats";
import UserStatsView from "@/components/user/UserStatsView";

export const dynamic = "force-dynamic";

interface StatsPageProps {
    searchParams: Promise<{ userId?: string }>;
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
    const { userId } = await searchParams;
    const statsData = await getUserStatsPageData(userId);

    return <UserStatsView stats={statsData} />;
}
