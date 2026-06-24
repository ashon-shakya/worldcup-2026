"use client";

import { useEffect, useState } from "react";

interface LocalTimeProps {
    date: string | Date | number;
    showTime?: boolean;
    showDate?: boolean;
    formatOptions?: Intl.DateTimeFormatOptions;
    fallbackFormatOptions?: Intl.DateTimeFormatOptions;
}

export default function LocalTime({
    date,
    showTime = true,
    showDate = true,
    formatOptions,
    fallbackFormatOptions,
}: LocalTimeProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const d = new Date(date);

    if (!isMounted) {
        // SSR Fallback in UTC to prevent hydration mismatches
        const defaultFallbackOptions: Intl.DateTimeFormatOptions = fallbackFormatOptions || {
            timeZone: "UTC",
            weekday: showDate ? "short" : undefined,
            month: showDate ? "short" : undefined,
            day: showDate ? "numeric" : undefined,
            hour: showTime ? "2-digit" : undefined,
            minute: showTime ? "2-digit" : undefined,
        };
        return <span className="opacity-90">{d.toLocaleDateString("en-GB", defaultFallbackOptions)} (UTC)</span>;
    }

    const defaultOptions: Intl.DateTimeFormatOptions = formatOptions || {
        weekday: showDate ? "short" : undefined,
        month: showDate ? "short" : undefined,
        day: showDate ? "numeric" : undefined,
        hour: showTime ? "2-digit" : undefined,
        minute: showTime ? "2-digit" : undefined,
    };

    return <span>{d.toLocaleDateString(undefined, defaultOptions)}</span>;
}
