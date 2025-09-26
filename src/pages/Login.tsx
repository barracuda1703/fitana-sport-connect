import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Nieprawidłowe dane logowania');
    }
    setIsLoading(false);
  };

  const fillDemoCredentials = (role: 'client' | 'trainer') => {
    if (role === 'client') {
      setEmail('client@test.com');
      setPassword('demo123');
    } else {
      setEmail('anna@test.com');
      setPassword('demo123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <Card className="w-full max-w-md bg-card/95 backdrop-blur shadow-floating">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-2xl">💪</span>
          </div>
          <CardTitle className="text-2xl font-bold">Fitana</CardTitle>
          <p className="text-muted-foreground">Zaloguj się do swojego konta</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
          </form>
          
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Demo - wypełnij dane testowe:
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('client')}
                className="flex-1"
              >
                Klient
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('trainer')}
                className="flex-1"
              >
                Trener
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <Button variant="link" className="text-sm">
              Nie masz konta? Zarejestruj się
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};