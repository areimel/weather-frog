import type { FrogScene as FrogSceneType } from "@/lib/frog-scenes";
import { FrogScene } from "@/components/frog-scene";
import { SceneCaption } from "@/components/art-preview/scene-caption";

interface SceneSlideProps {
  entry: { code: string; scene: FrogSceneType };
  index: number;
  total: number;
  conditionLabel: string;
}

export function SceneSlide({ entry, index, total, conditionLabel }: SceneSlideProps) {
  return (
    <div className="px-2">
      <div className="max-w-2xl mx-auto">
        <FrogScene
          frogCode={entry.code}
          scene={entry.scene}
          sizes="(min-width: 768px) 672px, 100vw"
        />
        <SceneCaption
          scene={entry.scene}
          index={index}
          total={total}
          conditionLabel={conditionLabel}
        />
      </div>
    </div>
  );
}
