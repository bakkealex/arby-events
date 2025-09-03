import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { config } from "@/lib/config";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";
import PageHeader from "@/components/shared/PageHeader";
import PageFooter from "@/components/shared/PageFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: config.app.title,
  description: config.app.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors`}
      >
        <AuthProvider session={session}>
          <div className="flex flex-col min-h-screen">
            <PageHeader />
            <main className="flex-1 bg-gray-50 dark:bg-gray-900">
              {children}
            </main>
            <PageFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
