import type { Metadata } from "next";
import "./globals.css";

import { AleoWalletProvider } from "@/components/wallet/AleoWalletProvider";

export const metadata: Metadata = {
  title: "ZK Airdrop Claim",
  description: "Privacy-preserving airdrop claim app on Aleo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AleoWalletProvider>{children}</AleoWalletProvider>
      </body>
    </html>
  );
}
