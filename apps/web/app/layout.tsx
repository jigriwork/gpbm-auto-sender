import type { Metadata } from "next";
import { BusinessProvider } from "../lib/business-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPBM Auto Sender",
  description: "SaaS-ready automatic bill PDF sender dashboard"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><BusinessProvider>{children}</BusinessProvider></body>
    </html>
  );
}
