"use client";

import { useEffect, useRef, useState } from "react";
import { getStoredFilters, setStoredFilters } from "@/lib/filterStorage";
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

    const checkedOnMount = useRef(false);
    const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

    useEffect(() => {
        setSearchValue(searchParams.get("search") || "");
    }, [searchParams]);

    useEffect(() => {
        const search = searchParams.get("search");
        const role = searchParams.get("role");
        const sort = searchParams.get("sort");
        const order = searchParams.get("order");

        const hasUrlParams = search !== null || role !== null || sort !== null || order !== null;

        if (checkedOnMount.current) {
            // Subsequent updates (after initial mount check)
            const currentFilters: Record<string, string> = {};
            if (search) currentFilters.search = search;
            if (role) currentFilters.role = role;
            if (sort) currentFilters.sort = sort;
            if (order) currentFilters.order = order;
            setStoredFilters("/admin/users", currentFilters);
            return;
        }

        checkedOnMount.current = true;

        // B. Initial mount load (if URL is empty, load from localStorage)
        if (!hasUrlParams) {
            const stored = getStoredFilters("/admin/users", {});
            if (Object.keys(stored).length > 0) {
                const params = new URLSearchParams(searchParams);
                if (stored.search) params.set("search", stored.search);
                if (stored.role) params.set("role", stored.role);
                if (stored.sort) params.set("sort", stored.sort);
                if (stored.order) params.set("order", stored.order);
                if (!params.has("page")) params.set("page", "1");
                replace(`${pathname}?${params.toString()}`);
            }
        }
    }, [searchParams, pathname, replace]);

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
                    value={searchValue}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                        handleSearch(e.target.value);
                    }}
                    className="max-w-sm bg-white text-gray-900 border-gray-300"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <Select
                    value={searchParams.get("role")?.toString() || "ALL"}
                    onValueChange={(value) => handleFilterChange("role", value)}
                >
                    <SelectTrigger className="w-[150px] bg-white text-black border-gray-300">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black border-gray-300">
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="MODERATOR">Moderator</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={searchParams.get("sort")?.toString() || "createdAt"}
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
                    value={searchParams.get("order")?.toString() || "desc"}
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
