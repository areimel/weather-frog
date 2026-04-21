"use client";

import { useMemo, useState } from "react";
import { FROG_SCENES } from "@/lib/frog-scenes";
import { ORDERED_CODES } from "@/components/art-preview/weather-code-labels";
import { ConditionTabs } from "@/components/art-preview/condition-tabs";
import { SceneCarousel } from "@/components/art-preview/scene-carousel";

export function ArtPreviewClient() {
  const { allEntries, codeFirstIndex } = useMemo(() => {
    const entries: { code: string; scene: (typeof FROG_SCENES)[string][number] }[] = [];
    const firstIndex: Record<string, number> = {};
    for (const code of ORDERED_CODES) {
      const scenes = FROG_SCENES[code] ?? [];
      if (scenes.length > 0 && firstIndex[code] === undefined) {
        firstIndex[code] = entries.length;
      }
      for (const scene of scenes) {
        entries.push({ code, scene });
      }
    }
    return { allEntries: entries, codeFirstIndex: firstIndex };
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [jumpToIndex, setJumpToIndex] = useState<{ index: number; nonce: number } | null>(null);

  const selectedCode = allEntries[activeIndex]?.code ?? ORDERED_CODES[0];

  const handleTabSelect = (code: string) => {
    const target = codeFirstIndex[code];
    if (target === undefined) return;
    setJumpToIndex({ index: target, nonce: Date.now() });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">
          Froggy&apos;s Gallery
        </h1>
        <p className="text-gray-500 text-sm">
          Browse all {allEntries.length} scenes across{" "}
          {Object.keys(codeFirstIndex).length} weather conditions
        </p>
      </header>

      <ConditionTabs selected={selectedCode} onSelect={handleTabSelect} />

      <SceneCarousel
        allEntries={allEntries}
        jumpToIndex={jumpToIndex}
        onActiveIndexChange={setActiveIndex}
      />
    </div>
  );
}
