import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    surname: user?.surname || '',
    city: user?.city || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          surname: formData.surname,
          city: formData.city,
        })
        .eq('id', user?.id);

      if (error) throw error;

      await refreshUser();

      toast({
        title: t('success'),
        description: 'Profil został zaktualizowany',
      });

      // Redirect based on role
      navigate(user?.role === 'client' ? '/client' : '/trainer', { replace: true });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Uzupełnij swój profil</CardTitle>
          <CardDescription>
            {user.role === 'trainer' 
              ? 'Uzupełnij podstawowe informacje o sobie jako trener'
              : 'Uzupełnij swoje dane aby móc korzystać z aplikacji'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Imię</Label>
              <Input
                id="name"
                value={user.name}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Nazwisko *</Label>
              <Input
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                required
                placeholder="Wprowadź nazwisko"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Miasto *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="Wprowadź miasto"
              />
            </div>

            {user.role === 'trainer' && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Po zakończeniu setup'u profilu będziesz mógł dodać więcej szczegółów w ustawieniach trenera, 
                  takich jak specjalizacje, ceny i dostępność.
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Zapisywanie...' : 'Zapisz i kontynuuj'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};