import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { PairContextProvider } from "./context/PairContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PairContextProvider>
      <App />
    </PairContextProvider>
  </StrictMode>
);
