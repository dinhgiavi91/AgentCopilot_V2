import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Copilot — Trợ Lý Đội Ngũ BHNT",
  description: "Dashboard TVV Zero-PII: thu nhập, cuộc gặp, streak và XP.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
