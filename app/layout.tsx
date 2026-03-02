import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gidan Amana - Member Registration",
  description: "Official membership registration portal for Gidan Amana Political Movement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body className="antialiased" style={{ colorScheme: "light" }}>{children}</body>
    </html>
  );
}
