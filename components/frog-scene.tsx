import Image from "next/image";
import type { FrogScene as FrogSceneType } from "@/lib/frog-scenes";

interface FrogSceneProps {
  frogCode: string;
  scene: FrogSceneType;
  className?: string;
  children?: React.ReactNode;
  sizes?: string;
}

export function FrogScene({ frogCode, scene, className = "", children, sizes }: FrogSceneProps) {
  const prefix = `${frogCode}-${scene.condition}-${scene.location}-${scene.activity}`;

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-2xl shadow-lg ${className}`}
    >
      {scene.layers.map((layer, i) => (
        <Image
          key={layer}
          src={`/frog/${prefix}_${layer}.png`}
          alt={layer === "fg" ? `Weather Frog - ${scene.condition}` : ""}
          fill
          sizes={sizes ?? "(min-width: 768px) 50vw, 100vw"}
          style={{ zIndex: i, objectFit: "cover" }}
          priority={layer === "bg"}
        />
      ))}
      {children && (
        <div className="absolute bottom-0 left-0 right-0 h-[45%] scrim-bottom z-10" />
      )}
      {children && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
          {children}
        </div>
      )}
    </div>
  );
}
