"use client";

import { type ReactNode, useMemo } from "react";
import { AleoWalletProvider as BaseAleoWalletProvider } from "@provablehq/aleo-wallet-adaptor-react";
import { WalletModalProvider } from "@provablehq/aleo-wallet-adaptor-react-ui";
import { LeoWalletAdapter } from "@provablehq/aleo-wallet-adaptor-leo";
import { DecryptPermission } from "@provablehq/aleo-wallet-adaptor-core";

type AleoWalletProviderProps = {
  children: ReactNode;
};

export function AleoWalletProvider({ children }: AleoWalletProviderProps) {
  const wallets = useMemo(() => {
    return [new LeoWalletAdapter()];
  }, []);

  return (
    <BaseAleoWalletProvider
      wallets={wallets}
      network={"testnet3" as any}
      decryptPermission={DecryptPermission.UponRequest}
      autoConnect={false}
      onError={(error) => console.error("Aleo wallet error:", error)}
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </BaseAleoWalletProvider>
  );
}
