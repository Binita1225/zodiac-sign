import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Single-page app: anything other than "/" is a 404.
const App = () => (
  <ThemeProvider>
    <Toaster />
    {window.location.pathname === "/" ? <Index /> : <NotFound />}
  </ThemeProvider>
);

export default App;
