import React from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SuiProviders from "@/providers/SuiProviders";
import { WalletProvider, useWallet } from "@/context/WalletContext";
import WalletConnectModal from "@/components/WalletConnectModal";
import { Shell } from "@/components/layout/Shell";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import Verify from "@/pages/verify";
import Certificates from "@/pages/certificates";
import CertificateDetail from "@/pages/certificates/detail";
import WalletPage from "@/pages/wallet";
import SearchPage from "@/pages/search";
import LandingPage from "@/pages/landing";

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-6 h-6 rounded-full border border-white/20 border-t-white/80 animate-spin mx-auto mb-4" />
        <div className="font-mono text-xs text-white/40 tracking-widest">INITIALIZING</div>
      </div>
    </div>
  );
}

const PREVIEW_MODE = new URLSearchParams(window.location.search).get("preview") === "1";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { connected, isConnecting } = useWallet();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!PREVIEW_MODE && !isConnecting && !connected) {
      setLocation("/");
    }
  }, [connected, isConnecting, setLocation]);

  if (!PREVIEW_MODE) {
    if (isConnecting) return <LoadingScreen />;
    if (!connected) return <LoadingScreen />;
  }

  return (
    <Shell>
      <Component />
    </Shell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/upload">
        <ProtectedRoute component={Upload} />
      </Route>
      <Route path="/verify">
        <ProtectedRoute component={Verify} />
      </Route>
      <Route path="/certificates">
        <ProtectedRoute component={Certificates} />
      </Route>
      <Route path="/certificates/:id">
        <ProtectedRoute component={CertificateDetail} />
      </Route>
      <Route path="/wallet">
        <ProtectedRoute component={WalletPage} />
      </Route>
      <Route path="/search">
        <ProtectedRoute component={SearchPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <SuiProviders>
      <WalletProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <WalletConnectModal />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </WalletProvider>
    </SuiProviders>
  );
}

export default App;
