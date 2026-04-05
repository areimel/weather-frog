import { SwiperSlide } from "swiper/react";
import type { FrogScene as FrogSceneType } from "@/lib/frog-scenes";
import { FrogScene } from "@/components/frog-scene";
import { SceneCaption } from "@/components/art-preview/scene-caption";

interface SceneSlideProps {
  frogCode: string;
  scene: FrogSceneType;
  index: number;
  total: number;
}

export function SceneSlide({ frogCode, scene, index, total }: SceneSlideProps) {
  return (
    <SwiperSlide>
      <div className="px-2">
        <FrogScene
          frogCode={frogCode}
          scene={scene}
          className="max-w-sm mx-auto"
          sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, 80vw"
        />
        <div className="max-w-sm mx-auto">
          <SceneCaption scene={scene} index={index} total={total} />
        </div>
      </div>
    </SwiperSlide>
  );
}
