import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNavigation } from '@/components/BottomNavigation';
import { SimplePhotoUploader } from '@/components/SimplePhotoUploader';
import { SimpleLanguageSelector } from '@/components/SimpleLanguageSelector';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sportsCategories, getSportName } from '@/data/sports';
import { useLanguage } from '@/contexts/LanguageContext';

export const ClientSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatarurl: '',
    bio: '',
    favorite_sport: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatarurl: user.avatarUrl || '',
        bio: user.bio || '',
        favorite_sport: ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          bio: formData.bio
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshUser();
      toast({
        title: 'Zapisano',
        description: 'Twoje ustawienia zostały zaktualizowane',
      });
      navigate('/client');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się zapisać ustawień',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploaded = async (url: string) => {
    setFormData(prev => ({ ...prev, avatarurl: url }));
    await refreshUser();
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/client')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Ustawienia</h1>
                <p className="text-sm text-muted-foreground">Zarządzaj swoim profilem</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Zapisz
            </Button>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {/* Profile Photo */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Zdjęcie profilowe</CardTitle>
            </CardHeader>
            <CardContent>
              <SimplePhotoUploader
                currentPhoto={formData.avatarurl}
                onPhotoUploaded={handlePhotoUploaded}
                userId={user?.id || ''}
              />
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Informacje podstawowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Imię i nazwisko</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Wprowadź imię i nazwisko"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">O mnie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Opowiedz coś o sobie..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favorite_sport">Ulubiony sport</Label>
                <Select
                  value={formData.favorite_sport}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, favorite_sport: value }))}
                >
                  <SelectTrigger id="favorite_sport">
                    <SelectValue placeholder="Wybierz sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportsCategories.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.icon} {getSportName(sport.id, currentLanguage.code)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Język aplikacji</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleLanguageSelector
                selectedLanguages={[]}
                onLanguagesChange={() => {}}
              />
            </CardContent>
          </Card>
        </div>

        <BottomNavigation 
          userRole="client" 
          activeTab="profile" 
          onTabChange={() => {}}
        />
      </div>
    </ErrorBoundary>
  );
};
