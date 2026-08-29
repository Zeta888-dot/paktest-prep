import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "PakTest Prep",
  description: "AI-powered MCQ practice for Pakistani competitive exams",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var t = localStorage.getItem("theme") || "dark";
                  var dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                  document.documentElement.classList.toggle("dark", dark);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="bg-background text-foreground antialiased"
        style={{
          fontFamily:
            '"Inter", "Noto Nastaliq Urdu", ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}