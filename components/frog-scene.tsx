import Image from "next/image";
import type { FrogScene as FrogSceneType } from "@/lib/frog-scenes";

interface FrogSceneProps {
  frogCode: string;
  scene: FrogSceneType;
  className?: string;
}

const LAYERS = ["bg", "mg", "fg"] as const;

export function FrogScene({ frogCode, scene, className = "" }: FrogSceneProps) {
  const prefix = `${frogCode}-${scene.condition}-${scene.location}-${scene.activity}`;

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-2xl shadow-lg ${className}`}
    >
      {LAYERS.map((layer, i) => (
        <Image
          key={layer}
          src={`/frog/${prefix}_${layer}.png`}
          alt={layer === "fg" ? `Weather Frog - ${scene.condition}` : ""}
          fill
          sizes="(min-width: 1200px) 380px, (min-width: 768px) 300px, 100vw"
          style={{ zIndex: i, objectFit: "cover" }}
          priority={layer === "bg"}
        />
      ))}
    </div>
  );
}
