import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "CentrAlign AI — Autonomous Employee",
  description: "An auditable AI worker that plans, executes, recovers, and verifies business workflows.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}