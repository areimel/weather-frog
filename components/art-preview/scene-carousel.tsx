"use client";

import { useEffect, useState } from "react";
import { Swiper as SwiperReact, SwiperSlide } from "swiper/react";
import { Thumbs, FreeMode, Keyboard, A11y } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import type { FrogScene as FrogSceneType } from "@/lib/frog-scenes";
import { SceneSlide } from "@/components/art-preview/scene-slide";
import { SceneThumb } from "@/components/art-preview/scene-thumb";
import { WEATHER_CODE_LABELS } from "@/components/art-preview/weather-code-labels";
import type { FrogCode } from "@/components/art-preview/weather-code-labels";

interface Entry {
  code: string;
  scene: FrogSceneType;
}

interface SceneCarouselProps {
  allEntries: Entry[];
  jumpToIndex: { index: number; nonce: number } | null;
  onActiveIndexChange: (index: number) => void;
}

export function SceneCarousel({
  allEntries,
  jumpToIndex,
  onActiveIndexChange,
}: SceneCarouselProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);

  useEffect(() => {
    if (mainSwiper && jumpToIndex) {
      mainSwiper.slideTo(jumpToIndex.index);
    }
  }, [jumpToIndex, mainSwiper]);

  return (
    <div className="space-y-4">
      <SwiperReact
        modules={[Thumbs, Keyboard, A11y]}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        onSwiper={setMainSwiper}
        onSlideChange={(s) => onActiveIndexChange(s.activeIndex)}
        keyboard={{ enabled: true }}
        spaceBetween={16}
        slidesPerView={1}
        a11y={{ prevSlideMessage: "Previous scene", nextSlideMessage: "Next scene" }}
        className="pb-4"
      >
        {allEntries.map((entry, i) => {
          const conditionLabel =
            WEATHER_CODE_LABELS[entry.code as FrogCode] ?? entry.scene.condition;
          return (
            <SwiperSlide
              key={`${entry.code}-${entry.scene.location}-${entry.scene.activity}`}
            >
              <SceneSlide
                entry={entry}
                index={i}
                total={allEntries.length}
                conditionLabel={conditionLabel}
              />
            </SwiperSlide>
          );
        })}
      </SwiperReact>

      <SwiperReact
        modules={[Thumbs, FreeMode]}
        onSwiper={setThumbsSwiper}
        watchSlidesProgress
        freeMode
        slidesPerView="auto"
        spaceBetween={8}
        className="!px-4"
      >
        {allEntries.map((entry) => (
          <SwiperSlide
            key={`thumb-${entry.code}-${entry.scene.location}-${entry.scene.activity}`}
            style={{ width: 64 }}
          >
            <SceneThumb frogCode={entry.code} scene={entry.scene} />
          </SwiperSlide>
        ))}
      </SwiperReact>
    </div>
  );
}
