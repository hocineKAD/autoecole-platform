import type { Metadata, Viewport } from "next";
import { schoolConfig } from "@/config/school";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: `${schoolConfig.name} — Auto-école à ${schoolConfig.city}`,
  description: schoolConfig.description,
  openGraph: {
    title: `${schoolConfig.name} — Auto-école à ${schoolConfig.city}`,
    description: schoolConfig.description,
    locale: "fr_DZ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F47D31",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Évite le flash de couleur claire au démarrage en mode sombre */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'dark' || (!t && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
