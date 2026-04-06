"use client";

import { useState } from "react";
import { FROG_SCENES } from "@/lib/frog-scenes";
import { ORDERED_CODES } from "@/components/art-preview/weather-code-labels";
import { ConditionTabs } from "@/components/art-preview/condition-tabs";
import { SceneCarousel } from "@/components/art-preview/scene-carousel";

const TOTAL_SCENES = ORDERED_CODES.reduce(
  (sum, code) => sum + (FROG_SCENES[code]?.length ?? 0),
  0
);

export function ArtPreviewClient() {
  const [selectedCode, setSelectedCode] = useState("01");
  const scenes = FROG_SCENES[selectedCode] ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">
          Froggy&apos;s Gallery
        </h1>
        <p className="text-gray-500 text-sm">
          Browse all {TOTAL_SCENES} scenes across{" "}
          {ORDERED_CODES.length} weather conditions
        </p>
      </header>

      <ConditionTabs selected={selectedCode} onSelect={setSelectedCode} />

      <p className="text-sm text-center text-gray-400">
        {scenes.length} {scenes.length === 1 ? "scene" : "scenes"}
      </p>

      <SceneCarousel key={selectedCode} code={selectedCode} scenes={scenes} />
    </div>
  );
}
