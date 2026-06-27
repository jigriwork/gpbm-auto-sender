import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPBM Auto Sender",
  description: "SaaS-ready automatic bill PDF sender dashboard"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
