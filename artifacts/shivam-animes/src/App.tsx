import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import SplashScreen from "@/pages/splash";
import LoginPage from "@/pages/login";
import HomePage from "@/pages/home";
import BrowsePage from "@/pages/browse";
import AnimeDetailPage from "@/pages/anime-detail";
import WatchPage from "@/pages/watch";
import WatchlistPage from "@/pages/watchlist";
import ContinueWatchingPage from "@/pages/continue-watching";
import BuyPremiumPage from "@/pages/buy-premium";
import SolveLinkPage from "@/pages/solve-link";
import AdminPage from "@/pages/admin";
import { useState, useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false, premiumOnly = false }: {
  component: React.ComponentType;
  adminOnly?: boolean;
  premiumOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (adminOnly && user.role !== "admin") return <Redirect to="/" />;
  if (premiumOnly && !user.isPremium && user.role !== "admin") return <Redirect to="/buy-premium" />;

  return <Component />;
}

function AppRouter() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/buy-premium" component={BuyPremiumPage} />
      <Route path="/solve-link" component={SolveLinkPage} />
      <Route path="/browse">
        {() => <ProtectedRoute component={BrowsePage} premiumOnly />}
      </Route>
      <Route path="/anime/:id">
        {() => <ProtectedRoute component={AnimeDetailPage} premiumOnly />}
      </Route>
      <Route path="/watch/:episodeId">
        {() => <ProtectedRoute component={WatchPage} premiumOnly />}
      </Route>
      <Route path="/watchlist">
        {() => <ProtectedRoute component={WatchlistPage} />}
      </Route>
      <Route path="/continue-watching">
        {() => <ProtectedRoute component={ContinueWatchingPage} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminPage} adminOnly />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
