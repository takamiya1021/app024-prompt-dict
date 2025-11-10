import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "キャラプロンプト辞書 - Character Prompt Dictionary",
  description: "キャラクター設定を一元管理し、AI画像生成やストーリー創作を効率化するWebアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
