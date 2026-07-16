"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

interface MatchCountdownProps {
  kickOff: string | Date | number;
}

function getTimeLeft(targetDate: Date) {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    total: difference,
    days,
    hours,
    minutes,
    seconds,
  };
}

export default function MatchCountdown({ kickOff }: MatchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() =>
    getTimeLeft(new Date(kickOff)),
  );

  useEffect(() => {
    const targetDate = new Date(kickOff);
    const tick = () => setTimeLeft(getTimeLeft(targetDate));

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [kickOff]);

  const isLive = timeLeft.total <= 0;

  return (
    <div className="flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold text-orange-600 dark:text-orange-300">
      <Clock3 className="h-3.5 w-3.5" />
      <span>{isLive ? "Starting now" : "Kick-off in"}</span>
      {!isLive && (
        <span className="font-mono font-black text-slate-900 dark:text-white">
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
          {String(timeLeft.hours).padStart(2, "0")}h{" "}
          {String(timeLeft.minutes).padStart(2, "0")}m{" "}
          {String(timeLeft.seconds).padStart(2, "0")}s
        </span>
      )}
    </div>
  );
}
