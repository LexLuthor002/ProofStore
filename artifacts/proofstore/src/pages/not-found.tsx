import { useLocation } from "wouter";
import { ShieldCheck } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <ShieldCheck className="h-8 w-8 text-white/15 mb-4" />
      <div className="font-mono text-6xl font-black text-white/10 mb-4">404</div>
      <p className="text-sm text-white/35 mb-6">This page doesn't exist</p>
      <button onClick={() => setLocation("/")}
        className="text-xs px-4 py-2 rounded text-white/50 hover:text-white/80 transition-all"
        style={{ border: "1px solid #1a1a1a" }}>
        Back to Home
      </button>
    </div>
  );
}
