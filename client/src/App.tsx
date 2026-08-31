/* Editorial Radar style: quiet app shell; the report's asymmetric layout carries the hierarchy. */
import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import { XpRewardProvider } from "./contexts/XpRewardContext";
import Home from "./pages/Home";

function Router() { return <Switch><Route path="/" component={Home} /><Route component={Home} /></Switch>; }
function App() { return <ErrorBoundary><XpRewardProvider><Router /><Toaster position="top-right" duration={3000} closeButton={true} visibleToasts={1} /></XpRewardProvider></ErrorBoundary>; }
export default App;
