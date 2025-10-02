import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import { AblyProvider } from "@/contexts/AblyContext";

import { Index } from "@/pages/Index";
import { Landing } from "@/pages/Landing";
import { AuthScreen } from "@/pages/AuthScreen";
import { AuthCallback } from "@/pages/AuthCallback";
import { ClientHome } from "@/pages/ClientHome";
import { ClientSettings } from "@/pages/ClientSettings";
import { TrainerDashboard } from "@/pages/TrainerDashboard";
import { CalendarPage } from "@/pages/Calendar";
import { ClientCalendarPage } from "@/pages/ClientCalendar";
import { TrainerCalendarListPage } from '@/pages/TrainerCalendarList';
import { TrainerSettings } from '@/pages/TrainerSettings';
import { TrainerProfileSettings } from '@/pages/TrainerProfileSettings';
import { TrainerStatistics } from '@/pages/TrainerStatistics';
import { ClientManagement } from "@/pages/ClientManagement";
import { ProfileSetup } from "@/pages/ProfileSetup";
import { ChatListPage } from "@/pages/ChatList";
import { ChatPage } from "@/pages/Chat";
import { ChatSafePage } from "@/pages/ChatSafe";
import { ProfilePage } from "@/pages/Profile";
import { ProfileEdit } from "@/pages/ProfileEdit";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, bootstrapped } = useAuth();
  
  // Don't redirect while still loading - wait for auth to settle
  if (!bootstrapped || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }
  
  // Only redirect if definitely not authenticated
  if (!user) {
    console.debug('[auth] ProtectedRoute: no user, redirecting to /');
    return <Navigate to="/" replace />;
  }
  
  console.debug('[auth] ProtectedRoute: user authenticated:', user.id);
  return <>{children}</>;
};

const RoleProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRole: 'client' | 'trainer' 
}> = ({ children, allowedRole }) => {
  const { user, isLoading, bootstrapped } = useAuth();
  
  // Don't redirect while still loading
  if (!bootstrapped || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (!user) {
    console.debug('[auth] RoleProtectedRoute: no user, redirecting to /');
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== allowedRole) {
    console.debug('[auth] RoleProtectedRoute: wrong role, redirecting');
    return <Navigate to={user.role === 'client' ? '/client' : '/trainer'} replace />;
  }
  
  console.debug('[auth] RoleProtectedRoute: user authorized:', user.id, user.role);
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/index" element={<Index />} />
        <Route path="/client" element={
          <RoleProtectedRoute allowedRole="client">
            <ClientHome />
          </RoleProtectedRoute>
        } />
        <Route path="/client/calendar" element={
          <RoleProtectedRoute allowedRole="client">
            <ClientCalendarPage />
          </RoleProtectedRoute>
        } />
        <Route path="/client/settings" element={
          <RoleProtectedRoute allowedRole="client">
            <ClientSettings />
          </RoleProtectedRoute>
        } />
        <Route path="/trainer" element={
          <RoleProtectedRoute allowedRole="trainer">
            <TrainerDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/trainer/calendar" element={
          <RoleProtectedRoute allowedRole="trainer">
            <CalendarPage />
          </RoleProtectedRoute>
        } />
        <Route path="/trainer/calendar-list" element={
          <RoleProtectedRoute allowedRole="trainer">
            <TrainerCalendarListPage />
          </RoleProtectedRoute>
        } />
        <Route path="/trainer/settings" element={
          <RoleProtectedRoute allowedRole="trainer">
            <TrainerSettings />
          </RoleProtectedRoute>
        } />
        <Route path="/trainer/profile-settings" element={
          <RoleProtectedRoute allowedRole="trainer">
            <TrainerProfileSettings />
          </RoleProtectedRoute>
        } />
        <Route path="/trainer/stats" element={
          <RoleProtectedRoute allowedRole="trainer">
            <TrainerStatistics />
          </RoleProtectedRoute>
        } />
        <Route path="/trainer/clients" element={
          <RoleProtectedRoute allowedRole="trainer">
            <ClientManagement />
          </RoleProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/profile-edit" element={
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        } />
        <Route path="/profile-setup" element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        } />
        {/* Chat routes */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatListPage />
          </ProtectedRoute>
        } />
        <Route path="/chat/:chatId" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ChatSafePage />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        
        {/* Legacy redirects */}
        <Route path="/chat-list" element={<Navigate to="/chat" replace />} />
        <Route path="/messages" element={<Navigate to="/chat" replace />} />
        <Route path="/wiadomosci" element={<Navigate to="/chat" replace />} />
        <Route path="/client/messages" element={<Navigate to="/chat" replace />} />
        <Route path="/trainer/messages" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </ErrorBoundary>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <AblyProvider>
                  <LocationProvider>
                    <AppRoutes />
                  </LocationProvider>
                </AblyProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
