import type { Metadata } from "next";
import "./globals.css";
import { JazzClientProvider } from "@/lib/jazz";

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
        <JazzClientProvider>{children}</JazzClientProvider>
      </body>
    </html>
  );
}
