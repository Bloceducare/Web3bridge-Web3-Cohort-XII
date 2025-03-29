import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./contexts/appContext.jsx";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

let queryClient;

const getQueryClient = () => {
  if (!queryClient) {
    queryClient = new QueryClient();
  }

  return queryClient;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={getQueryClient()}>
      <AppProvider>
        <App />
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>
);