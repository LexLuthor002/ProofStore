import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import {
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
} from "@mysten/dapp-kit";

interface WalletContextValue {
  address: string | null;
  walletName: string | null;
  connected: boolean;
  isConnecting: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const account = useCurrentAccount();
  const { currentWallet, connectionStatus } = useCurrentWallet();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const address = account?.address ?? null;
  const connected = connectionStatus === "connected";
  const isConnecting = connectionStatus === "connecting";
  const walletName = currentWallet?.name ?? null;

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const disconnect = useCallback(() => {
    disconnectWallet();
  }, [disconnectWallet]);

  return (
    <WalletContext.Provider
      value={{ address, walletName, connected, isConnecting, isModalOpen, openModal, closeModal, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
