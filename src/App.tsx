
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();
  const [isReady, setIsReady] = useState(false);
  
  // Wait for auth state to be determined
  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);
  
  if (!isReady) {
    // Show loading screen while checking auth
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Auth redirect component (redirect to home if already authenticated)
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();
  const [isReady, setIsReady] = useState(false);
  
  // Wait for auth state to be determined
  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);
  
  if (!isReady) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to home if authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/auth" element={
        <AuthRedirect>
          <Auth />
        </AuthRedirect>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
