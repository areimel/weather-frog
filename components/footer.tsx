export function Footer() {
  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-white/30 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <span>Weather Frog</span>
        <span>
          Data from{" "}
          <a
            href="https://openweathermap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700"
          >
            OpenWeatherMap
          </a>{" "}
          · Frog art by Google
        </span>
        <span>Built with Next.js</span>
      </div>
    </footer>
  );
}
