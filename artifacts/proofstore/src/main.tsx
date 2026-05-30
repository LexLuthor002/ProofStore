import { createRoot } from "react-dom/client";
import App from "./App";
import "@mysten/dapp-kit/dist/index.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
