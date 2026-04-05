"use client";

import { useEffect, useRef } from "react";
import { FROG_SCENES } from "@/lib/frog-scenes";
import {
  ORDERED_CODES,
  WEATHER_CODE_LABELS,
} from "@/components/art-preview/weather-code-labels";

interface ConditionTabsProps {
  selected: string;
  onSelect: (code: string) => void;
}

export function ConditionTabs({ selected, onSelect }: ConditionTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>("[data-active]");
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selected]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
    >
      {ORDERED_CODES.map((code) => {
        const scenes = FROG_SCENES[code];
        if (!scenes?.length) return null;
        const isActive = code === selected;

        return (
          <button
            key={code}
            onClick={() => onSelect(code)}
            {...(isActive ? { "data-active": true } : {})}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "bg-green-700 text-white shadow-sm"
                : "bg-white/60 backdrop-blur-sm text-green-800 hover:bg-white/80"
            }`}
          >
            {WEATHER_CODE_LABELS[code as keyof typeof WEATHER_CODE_LABELS]}{" "}
            <span className={`text-xs ${isActive ? "text-green-200" : "text-gray-400"}`}>
              {scenes.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
