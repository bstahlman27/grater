import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grater",
  description: "A private game journal for reviews, lists, and friend picks.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
