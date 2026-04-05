import type { FrogScene } from "@/lib/frog-scenes";

interface SceneCaptionProps {
  scene: FrogScene;
  index: number;
  total: number;
}

function formatLabel(text: string): string {
  return text.replace(/-/g, " ");
}

export function SceneCaption({ scene, index, total }: SceneCaptionProps) {
  return (
    <div className="mt-3 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
      <p className="text-xs text-gray-400 font-mono mb-1">
        {index + 1} / {total}
      </p>
      <p className="text-sm font-semibold text-green-900 capitalize">
        {formatLabel(scene.condition)}
      </p>
      <p className="text-xs text-gray-600 capitalize">
        {formatLabel(scene.location)} &middot; {formatLabel(scene.activity)}
      </p>
    </div>
  );
}
