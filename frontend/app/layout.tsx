import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import { AntdAppProvider } from "@/components/antd-app-provider";
import { AuthSessionProvider } from "@/components/session-provider";
import { AppNav } from "@/components/app-nav";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auth practice",
  description: "NextAuth + Express JWT flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <AntdRegistry>
          <AntdAppProvider>
            <AuthSessionProvider>
              <AppNav />
              <main className="flex-1"><Providers>{children}</Providers></main>
            </AuthSessionProvider>
          </AntdAppProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
