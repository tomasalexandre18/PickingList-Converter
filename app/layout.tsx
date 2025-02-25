import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import "./globals.css";

const font = Nunito({
    weight: ["400", "600"],
    display: "swap",
    subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PickingList",
  description: "PickingList to pdf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
