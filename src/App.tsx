import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleSwitch } from "@/components/RoleSwitch";
import { Index } from "@/pages/Index";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { ClientHome } from "@/pages/ClientHome";
import { TrainerDashboard } from "@/pages/TrainerDashboard";
import { CalendarPage } from "@/pages/Calendar";
import { ClientCalendarPage } from "@/pages/ClientCalendar";
import { TrainerCalendarListPage } from '@/pages/TrainerCalendarList';
import { TrainerSettingsPage } from '@/pages/TrainerSettings';
import { ProfileEditPage } from "@/pages/ProfileEdit";
import { ChatListPage } from "@/pages/ChatList";
import { ChatPage } from "@/pages/Chat";
import { ProfilePage } from "@/pages/Profile";
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
    <div className="min-h-screen w-full">
      <RoleSwitch />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Index />} />
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
          <CalendarPage />
        </ProtectedRoute>
      } />
      <Route path="/client-calendar" element={
        <ProtectedRoute>
          <ClientCalendarPage />
        </ProtectedRoute>
      } />
      <Route path="/trainer-dashboard" element={
        <ProtectedRoute>
          <TrainerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/trainer-calendar" element={
        <ProtectedRoute>
          <TrainerCalendarListPage />
        </ProtectedRoute>
      } />
      <Route path="/trainer-settings" element={
        <ProtectedRoute>
          <TrainerSettingsPage />
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
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
