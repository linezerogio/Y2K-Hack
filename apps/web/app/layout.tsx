import type { Metadata } from "next";
import "./globals.css";
import { JazzBoundary } from "@/components/JazzBoundary";

export const metadata: Metadata = {
  title: "GeoStumble",
  description: "StumbleUpon for Y2K homepages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <JazzBoundary>{children}</JazzBoundary>
      </body>
    </html>
  );
}
