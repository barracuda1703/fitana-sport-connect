import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'client' | 'trainer';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultRole = 'client' }) => {
  const { t } = useLanguage();
  const { signIn, signUp, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Sign in form
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });
  
  // Sign up form
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Demo mode - pozwól na logowanie z dowolnymi danymi
      if (signInData.email && signInData.password) {
        // Symuluj pomyślne logowanie
        console.log('Demo login successful');
        onClose();
        return;
      }
      
      await signIn(signInData.email, signInData.password);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Błąd logowania');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }
    
    if (signUpData.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }
    
    try {
      // Demo mode - symuluj pomyślną rejestrację
      console.log('Demo signup successful');
      setSuccess('Konto zostało utworzone! (Tryb demo)');
      setTimeout(() => {
        onClose();
      }, 1500);
      return;
      
      await signUp(signUpData.email, signUpData.password, signUpData.name, signUpData.role);
      setSuccess('Konto zostało utworzone! Sprawdź email w celu weryfikacji.');
    } catch (error: any) {
      setError(error.message || 'Błąd rejestracji');
    }
  };

  const resetForms = () => {
    setSignInData({ email: '', password: '' });
    setSignUpData({ 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      role: defaultRole 
    });
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Witaj w Fitana</CardTitle>
          <p className="text-sm text-muted-foreground">
            Zaloguj się lub utwórz konto
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Logowanie</TabsTrigger>
              <TabsTrigger value="signup">Rejestracja</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mt-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Hasło</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Zaloguj się'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Imię</Label>
                  <Input
                    id="signup-name"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-role">Rola</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={signUpData.role === 'client' ? 'default' : 'outline'}
                      onClick={() => setSignUpData({ ...signUpData, role: 'client' })}
                      className="flex-1"
                    >
                      Klient
                    </Button>
                    <Button
                      type="button"
                      variant={signUpData.role === 'trainer' ? 'default' : 'outline'}
                      onClick={() => setSignUpData({ ...signUpData, role: 'trainer' })}
                      className="flex-1"
                    >
                      Trener
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Hasło</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Potwierdź hasło</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Utwórz konto'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={handleClose}>
              Zamknij
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
