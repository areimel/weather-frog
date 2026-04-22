import Image from "next/image";
import type { FrogScene as FrogSceneType } from "@/lib/frog-scenes";
import { getSceneBackdrop } from "@/lib/scene-backdrops";

interface FrogSceneProps {
  frogCode: string;
  scene: FrogSceneType;
  className?: string;
  children?: React.ReactNode;
  sizes?: string;
  fillHeight?: boolean;
}

export function FrogScene({
  frogCode,
  scene,
  className = "",
  children,
  sizes,
  fillHeight = false,
}: FrogSceneProps) {
  const prefix = `${frogCode}-${scene.condition}-${scene.location}-${scene.activity}`;
  const backdrop = getSceneBackdrop(frogCode);

  const outerClasses = fillHeight
    ? `overflow-hidden rounded-2xl shadow-lg flex flex-col h-full ${className}`
    : `overflow-hidden rounded-2xl shadow-lg ${className}`;

  const artClasses = fillHeight
    ? "relative flex-1 min-h-0"
    : "relative aspect-square";

  return (
    <div className={outerClasses} style={{ backgroundColor: backdrop }}>
      {children && <div className="p-6">{children}</div>}
      <div className={artClasses}>
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
      </div>
    </div>
  );
}
