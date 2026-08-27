import type { Metadata } from "next"
import { Geist, Space_Grotesk } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PakTest Prep",
  description: "AI-Powered Test Preparation for Pakistan",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try {
              var t = localStorage.getItem("theme") || "dark";
              var dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
              document.documentElement.classList.toggle("dark", dark);
            } catch (e) {}`}
        </Script>
      </head>
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  )
}