import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WeatherProvider } from "@/components/weather-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weather Frog",
  description:
    "A playful weather app featuring Google's beloved Weather Frog artwork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:h-full md:overflow-hidden">
        <WeatherProvider>
          <Header />
          <main className="flex-1 md:min-h-0">{children}</main>
          <Footer />
        </WeatherProvider>
      </body>
    </html>
  );
}
