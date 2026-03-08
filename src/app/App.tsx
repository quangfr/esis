import { RouterProvider } from "react-router";
import { AppStateProvider } from "./app-state";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AppStateProvider>
  );
}

export default App;
