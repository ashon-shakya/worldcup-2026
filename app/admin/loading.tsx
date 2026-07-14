import Loader from "@/components/ui/Loader";

export default function AdminLoading() {
    return (
        <div className="w-full py-12">
            <Loader fullscreen={false} />
        </div>
    );
}
