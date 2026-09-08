"use client";

import { useEffect, useState } from "react";

type LocalTimeProps = {
  className?: string;
};

type TimeValue = {
  dateTime: string;
  label: string;
};

function getLocalTime(): TimeValue {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(now);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const hour = getPart("hour");
  const minute = getPart("minute");
  const dayPeriod = getPart("dayPeriod");
  const timeZone = getPart("timeZoneName");

  return {
    dateTime: now.toISOString(),
    label: `${timeZone} ${hour}:${minute} ${dayPeriod}`.trim(),
  };
}

export function LocalTime({ className }: LocalTimeProps) {
  const [time, setTime] = useState<TimeValue | null>(null);

  useEffect(() => {
    const updateTime = () => setTime(getLocalTime());

    updateTime();
    const timer = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <time
      className={className}
      dateTime={time?.dateTime}
      aria-label={time ? `Hora local: ${time.label}` : "Cargando hora local"}
    >
      {time?.label ?? "\u00a0"}
    </time>
  );
}
