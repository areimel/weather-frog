import type { FrogScene as FrogSceneType } from "@/lib/frog-scenes";
import { FrogScene } from "@/components/frog-scene";

interface SceneThumbProps {
  frogCode: string;
  scene: FrogSceneType;
}

export function SceneThumb({ frogCode, scene }: SceneThumbProps) {
  return (
    <div
      data-scene-thumb
      className="w-16 h-16 rounded-lg overflow-hidden outline outline-2 outline-transparent outline-offset-2 transition-[outline-color] cursor-pointer"
    >
      <FrogScene frogCode={frogCode} scene={scene} sizes="64px" />
    </div>
  );
}
