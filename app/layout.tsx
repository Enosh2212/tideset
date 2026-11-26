import type { Metadata } from "next";
import "./globals.css";
import "./product-design.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bothway.app"),
  title: "Bothway — Clear agreements. Better work.",
  description:
    "Create a plan both sides approve. Connect scope, milestone payments and deliverables in one shared agreement.",
  icons: {
    icon: [
      { url: "/brand/bothway-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/bothway-icon.svg",
  },
  openGraph: {
    title: "Bothway — Clear agreements. Better work.",
    description: "Connect scope, milestone payments and deliverables in one shared agreement.",
    siteName: "Bothway",
    images: [
      {
        url: "/brand/bothway-icon.svg",
        width: 512,
        height: 512,
        alt: "Bothway Official Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="antialiased min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
