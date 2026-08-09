import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { NextAuthProvider } from "@/components/auth/providers";
import { NotificationProvider } from "@/lib/notification-context";
import { LanguageProvider } from "@/lib/language-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Flearn — AI Academic Study Planner",
  description:
    "Bilingual AI study planner that turns lecture documents into Google Calendar-aware workflows using GLM-5.2.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full font-sans antialiased bg-background text-foreground transition-colors duration-300">
        <NextAuthProvider>
          <AuthProvider>
            <LanguageProvider>
              <NotificationProvider>
                <ThemeProvider>
                  {children}
                </ThemeProvider>
              </NotificationProvider>
            </LanguageProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
