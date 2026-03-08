import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppStateProvider } from "./app-state";

function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
    </AppStateProvider>
  );
}

export default App;
