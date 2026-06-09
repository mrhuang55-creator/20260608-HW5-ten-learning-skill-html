import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "機器學習十大演算法 - 互動學習平台",
  description: "基於機器學習十大演算法研讀報告，提供動態主題學習、概念模擬視覺化、自我檢測練習與 AI 智慧學習助理。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col font-sans select-none">
        {children}
      </body>
    </html>
  );
}
