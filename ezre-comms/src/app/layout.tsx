import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { ConvexClientProvider } from '@/components/ConvexClientProvider'
import { Navigation } from '@/components/Navigation'
import "./globals.css";

// Using Inter as it's very similar to SF Pro and widely available
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ezre Comms - AI Communications Assistant",
  description: "Transform briefs into polished, on-brand communications across all channels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <html lang="en" className="scroll-smooth">
          <body
            className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}
          >
            <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
