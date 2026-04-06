import type { Metadata } from "next";
import { ArtPreviewClient } from "@/components/art-preview/art-preview-client";

export const metadata: Metadata = {
  title: "Art Gallery – Weather Frog",
  description:
    "Browse all frog scenes across every weather condition in the Weather Frog collection.",
};

export default function ArtPreviewPage() {
  return <ArtPreviewClient />;
}
