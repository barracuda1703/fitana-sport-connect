import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { ClientHome } from "@/pages/ClientHome";
import { TrainerDashboard } from "@/pages/TrainerDashboard";
import { ClientCalendarPage } from "@/pages/ClientCalendar";
import { TrainerCalendarListPage } from "@/pages/TrainerCalendarList";
import { ProfileEditPage } from "@/pages/ProfileEdit";
import { ChatListPage } from "@/pages/ChatList";
import { ChatPage } from "@/pages/Chat";
import { ProfilePage } from "@/pages/Profile";
import { DevMenu } from "@/components/DevMenu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={user ? (
        user.role === 'client' ? <Navigate to="/client" replace /> : <Navigate to="/trainer" replace />
      ) : <Landing />} />
      <Route path="/client" element={
        <ProtectedRoute>
          <ClientHome />
        </ProtectedRoute>
      } />
      <Route path="/trainer" element={
        <ProtectedRoute>
          <TrainerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute>
          {user?.role === 'client' ? <ClientCalendarPage /> : <TrainerCalendarListPage />}
        </ProtectedRoute>
      } />
      <Route path="/profile/edit" element={
        <ProtectedRoute>
          <ProfileEditPage />
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <ChatListPage />
        </ProtectedRoute>
      } />
      <Route path="/chat/:chatId" element={
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
            <DevMenu />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
