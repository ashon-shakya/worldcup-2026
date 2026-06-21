"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (page: number) => {
        replace(createPageURL(page));
    };

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: number[] = [];
        if (totalPages <= 4) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 1);
            if (start + 3 > totalPages) {
                start = totalPages - 3;
            }
            for (let i = 0; i < 4; i++) {
                pages.push(start + i);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-gray-100">
            <div className="flex flex-1 justify-between sm:hidden">
                <Button
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Next
                </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{" "}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-50"
                            disabled={currentPage <= 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous</span>
                        </Button>

                        {getPageNumbers().map((page, i) =>
                            page === "..." ? (
                                <span key={`dots-${i}`} className="px-2 py-1 text-sm text-gray-400">…</span>
                            ) : (
                                <Button
                                    key={page}
                                    variant="outline"
                                    size="sm"
                                    className={`min-w-[36px] h-9 ${
                                        currentPage === page
                                            ? "bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
                                            : "text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-50"
                                    }`}
                                    onClick={() => handlePageChange(page as number)}
                                >
                                    {page}
                                </Button>
                            )
                        )}

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-50"
                            disabled={currentPage >= totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
