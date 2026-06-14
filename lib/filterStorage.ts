export function getStoredFilters(pageKey: string, defaultValues: Record<string, any>): Record<string, any> {
    if (typeof window === "undefined") return defaultValues;
    try {
        const stored = localStorage.getItem("worldcup2026_page_filters");
        if (stored) {
            const allFilters = JSON.parse(stored);
            if (allFilters && allFilters[pageKey]) {
                return { ...defaultValues, ...allFilters[pageKey] };
            }
        }
    } catch (e) {
        console.error("Error reading stored filters", e);
    }
    return defaultValues;
}

export function setStoredFilters(pageKey: string, filters: Record<string, any>) {
    if (typeof window === "undefined") return;
    try {
        const stored = localStorage.getItem("worldcup2026_page_filters");
        const allFilters = stored ? JSON.parse(stored) : {};
        allFilters[pageKey] = filters;
        localStorage.setItem("worldcup2026_page_filters", JSON.stringify(allFilters));
    } catch (e) {
        console.error("Error saving filters", e);
    }
}
