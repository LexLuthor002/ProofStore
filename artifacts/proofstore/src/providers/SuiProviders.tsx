import { SuiClientProvider, WalletProvider, createNetworkConfig } from "@mysten/dapp-kit";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const TATUM_RPC_PROXY = `${window.location.origin}/api/sui-rpc`;

const { networkConfig } = createNetworkConfig({
  mainnet: { url: TATUM_RPC_PROXY },
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function SuiProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect preferredWallets={["Sui Wallet", "Suiet"]}>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
