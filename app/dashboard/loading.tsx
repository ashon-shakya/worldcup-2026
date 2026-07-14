import Loader from "@/components/ui/Loader";

export default function DashboardLoading() {
    return (
        <div className="w-full py-12">
            <Loader fullscreen={false} />
        </div>
    );
}
