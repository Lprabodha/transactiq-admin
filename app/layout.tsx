import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { APP_CONFIG } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - AI-Powered Fraud Detection`,
  description: APP_CONFIG.description,
  keywords: ['fraud detection', 'payment intelligence', 'chargeback prevention', 'AI analytics', 'transaction monitoring'],
  authors: [{ name: APP_CONFIG.author }],
  openGraph: {
    title: `${APP_CONFIG.name} - Fraud Detection Dashboard`,
    description: APP_CONFIG.description,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <DashboardLayout>{children}</DashboardLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
