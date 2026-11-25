import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { currentUser } from "@/lib/session";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "HireHub",
    template: "%s · HireHub",
  },
  description: "A job board and application tracker for small teams.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans`}>
        <SiteHeader user={user} />
        <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-stone-500">HireHub</div>
        </footer>
      </body>
    </html>
  );
}
