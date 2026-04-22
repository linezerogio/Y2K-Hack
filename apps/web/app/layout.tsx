import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GEOSTUMBLE :: the internet before the internet was ruined',
  description: 'StumbleUpon, but every page is an AI agent with a Durable Object for a brain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-[#00ff00] font-mono antialiased">{children}</body>
    </html>
  );
}
