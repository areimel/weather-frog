import { FROG_SCENES } from "@/lib/frog-scenes";
import { FrogScene } from "@/components/frog-scene";

// Pick a sample scene from various weather codes for the gallery
const GALLERY_CODES = ["01", "05", "10", "11", "15", "17", "24", "25"];

function getGalleryScenes() {
  return GALLERY_CODES.map((code) => {
    const scenes = FROG_SCENES[code];
    if (!scenes || scenes.length === 0) return null;
    return { code, scene: scenes[0] };
  }).filter((s): s is { code: string; scene: (typeof FROG_SCENES)[string][number] } => s !== null);
}

export default function AboutPage() {
  const galleryScenes = getGalleryScenes();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      {/* Intro */}
      <section className="text-center">
        <div className="text-7xl mb-4">🐸</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          About Weather Frog
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          The Weather Frog (also known as &ldquo;Froggy&rdquo;) is Google&rsquo;s
          beloved weather mascot. Originally featured in Google&rsquo;s Pixel
          Weather app and Nest Hub displays, Froggy reacts to the weather in
          delightful ways — reading on the beach when it&rsquo;s sunny, huddling
          under an umbrella in the rain, or making s&rsquo;mores by a campfire
          on a cloudy night.
        </p>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mt-4">
          Though Google removed Froggy from their newer Pixel Weather designs in
          late 2024, the community has kept the spirit alive. This app brings
          Froggy back to life, pairing the artwork with real weather data so you
          can see what Froggy is up to in your local weather.
        </p>
      </section>

      {/* Gallery */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
          Froggy Through the Seasons
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryScenes.map(({ code, scene }) => (
            <div key={code} className="space-y-2">
              <FrogScene frogCode={code} scene={scene} className="w-full" />
              <p className="text-xs text-gray-500 text-center capitalize">
                {scene.condition.replace(/-/g, " ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Credits */}
      <section className="text-center bg-white/60 rounded-2xl p-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Credits</h2>
        <div className="space-y-2 text-sm text-gray-500">
          <p>
            Frog artwork by{" "}
            <span className="font-medium text-gray-700">Google</span>
          </p>
          <p>
            Weather data from{" "}
            <a
              href="https://openweathermap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-700 underline hover:text-green-800"
            >
              OpenWeatherMap
            </a>
          </p>
          <p>
            Built with{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-700 underline hover:text-gray-900"
            >
              Next.js
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
