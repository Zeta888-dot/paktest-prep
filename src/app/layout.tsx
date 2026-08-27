import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeInit } from "@/components/theme-init"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

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
      <body className={geist.className}>
        <ThemeInit />
        {children}
      </body>
    </html>
  )
}