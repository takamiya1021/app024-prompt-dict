import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./components/RegisterSW";

export const metadata: Metadata = {
  title: "キャラプロンプト辞書 - Character Prompt Dictionary",
  description: "キャラクター設定を一元管理し、AI画像生成やストーリー創作を効率化するWebアプリケーション",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "キャラ辞書",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
