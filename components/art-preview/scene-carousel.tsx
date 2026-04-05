"use client";

import { Swiper } from "swiper/react";
import { Navigation, Pagination, Keyboard, A11y } from "swiper/modules";
import type { FrogScene as FrogSceneType } from "@/lib/frog-scenes";
import { SceneSlide } from "@/components/art-preview/scene-slide";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface SceneCarouselProps {
  code: string;
  scenes: FrogSceneType[];
}

export function SceneCarousel({ code, scenes }: SceneCarouselProps) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Keyboard, A11y]}
      spaceBetween={16}
      slidesPerView={1}
      centeredSlides
      keyboard={{ enabled: true }}
      pagination={{ clickable: true }}
      navigation
      a11y={{
        prevSlideMessage: "Previous scene",
        nextSlideMessage: "Next scene",
      }}
      breakpoints={{
        640: { slidesPerView: 1.2 },
        768: { slidesPerView: 1.5 },
        1024: { slidesPerView: 2 },
        1280: { slidesPerView: 2.5 },
      }}
      className="pb-12"
    >
      {scenes.map((scene, i) => (
        <SceneSlide
          key={`${scene.location}-${scene.activity}`}
          frogCode={code}
          scene={scene}
          index={i}
          total={scenes.length}
        />
      ))}
    </Swiper>
  );
}
