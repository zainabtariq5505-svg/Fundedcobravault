import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AuthGuard from "@/components/AuthGuard";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cobra Vault",
  description: "Affiliate Command Center for Funded Cobra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B0614] text-[#F8F5FF] min-h-screen flex`}
      >
        <AuthGuard>
          <Toaster theme="dark" position="top-right" toastOptions={{ style: { background: '#161022', border: '1px solid #7C3AED', color: '#F8F5FF' } }} />
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen md:ml-64 w-full">
            <Topbar />
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
