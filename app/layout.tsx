import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/ui/toast"
import { setupStorage } from "@/utils/setup-storage"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "MindEase - Mental Health App",
  description: "Track your mood, journal your thoughts, and improve your mental wellbeing",
  icons: {
    icon: "/favicon.svg",
  },
    generator: 'v0.dev'
}

// Call setup function on the server
if (typeof window === "undefined") {
  setupStorage().catch((error) => {
    console.error("Error setting up storage:", error)
  })
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'