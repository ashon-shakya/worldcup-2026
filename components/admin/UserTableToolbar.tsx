"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function UserTableToolbar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("search", term);
        } else {
            params.delete("search");
        }
        params.set("page", "1"); // Reset to page 1 on search
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "ALL") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1");
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
                <Input
                    placeholder="Search users..."
                    defaultValue={searchParams.get("search")?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="max-w-sm bg-white text-gray-900 border-gray-300"
                />
            </div>
            <div className="flex gap-2">
                <Select
                    defaultValue={searchParams.get("role")?.toString() || "ALL"}
                    onValueChange={(value) => handleFilterChange("role", value)}
                >
                    <SelectTrigger className="w-[150px] bg-white text-black border-gray-300">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black border-gray-300">
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    defaultValue={searchParams.get("sort")?.toString() || "createdAt"}
                    onValueChange={(value) => handleFilterChange("sort", value)}
                >
                    <SelectTrigger className="w-[180px] bg-white text-black border-gray-300">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black border-gray-300">
                        <SelectItem value="createdAt">Date Joined</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="role">Role</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    defaultValue={searchParams.get("order")?.toString() || "desc"}
                    onValueChange={(value) => handleFilterChange("order", value)}
                >
                    <SelectTrigger className="w-[120px] bg-white text-black border-gray-300">
                        <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black border-gray-300">
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
