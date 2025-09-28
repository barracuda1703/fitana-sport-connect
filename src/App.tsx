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
import { ClientManagement } from "@/pages/ClientManagement";
import { TrainerStatistics } from "@/pages/TrainerStatistics";
import { TrainerPreferences } from "@/pages/TrainerPreferences";
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

const RoleProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRole: 'client' | 'trainer' 
}> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'client' ? '/client' : '/trainer'} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Index />} />
      <Route path="/client" element={
        <RoleProtectedRoute allowedRole="client">
          <ClientHome />
        </RoleProtectedRoute>
      } />
      <Route path="/trainer" element={
        <RoleProtectedRoute allowedRole="trainer">
          <TrainerDashboard />
        </RoleProtectedRoute>
      } />
      <Route path="/calendar" element={
        <RoleProtectedRoute allowedRole="client">
          <CalendarPage />
        </RoleProtectedRoute>
      } />
      <Route path="/client-calendar" element={
        <RoleProtectedRoute allowedRole="client">
          <ClientCalendarPage />
        </RoleProtectedRoute>
      } />
      <Route path="/trainer-dashboard" element={
        <RoleProtectedRoute allowedRole="trainer">
          <TrainerDashboard />
        </RoleProtectedRoute>
      } />
      <Route path="/trainer-calendar" element={
        <RoleProtectedRoute allowedRole="trainer">
          <TrainerCalendarListPage />
        </RoleProtectedRoute>
      } />
      <Route path="/trainer-settings" element={
        <RoleProtectedRoute allowedRole="trainer">
          <TrainerSettingsPage />
        </RoleProtectedRoute>
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
      <Route path="/trainer/clients" element={
        <RoleProtectedRoute allowedRole="trainer">
          <ClientManagement />
        </RoleProtectedRoute>
      } />
      <Route path="/trainer/statistics" element={
        <RoleProtectedRoute allowedRole="trainer">
          <TrainerStatistics />
        </RoleProtectedRoute>
      } />
      <Route path="/trainer/preferences" element={
        <RoleProtectedRoute allowedRole="trainer">
          <TrainerPreferences />
        </RoleProtectedRoute>
      } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      {user && <RoleSwitch />}
      <AppRoutes />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <AuthenticatedApp />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
