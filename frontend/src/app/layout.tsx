import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth";
import { AdminProvider } from "@/components/auth/AdminProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wibi - Time Banking Skill Platform",
  description: "Platform peer-to-peer skill exchange untuk pelajar menggunakan sistem Time Banking",
  icons: {
    icon: '/wibi.png',
    shortcut: '/wibi.png',
    apple: '/wibi.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AdminProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </AdminProvider>
          <Sonner />
        </ThemeProvider>
      </body>
    </html>
  );
}
