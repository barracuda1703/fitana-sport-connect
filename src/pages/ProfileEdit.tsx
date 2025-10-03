import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNavigation } from '@/components/BottomNavigation';
import { SimplePhotoUploader } from '@/components/SimplePhotoUploader';
import { InterfaceLanguageSelector } from '@/components/InterfaceLanguageSelector';
import { trainersService } from '@/services/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const ProfileEdit: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // Client-specific fields
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Trainer-specific fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        if (user.role === 'client') {
          // Load client profile data
          setName(user.name || '');
          setSurname(user.surname || '');
          setCity(user.city || '');
          setAvatarUrl(user.avatarUrl || '');
        } else if (user.role === 'trainer') {
          // Load trainer profile data
          const trainer = await trainersService.getByUserId(user.id);
          if (trainer) {
            setDisplayName(trainer.display_name || '');
            setBio(trainer.bio || '');
            setSpecialties(trainer.specialties || []);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (user.role === 'client') {
        // Update client profile in profiles table
        const { error } = await supabase
          .from('profiles')
          .update({
            name: name.trim(),
            surname: surname.trim(),
            city: city.trim(),
            avatarurl: avatarUrl
          })
          .eq('id', user.id);

        if (error) throw error;

        await refreshUser();

        toast({
          title: "Profil zaktualizowany",
          description: "Twoje zmiany zostały zapisane"
        });
      } else if (user.role === 'trainer') {
        // Update trainer profile in trainers table
        await trainersService.updateByUserId(user.id, {
          display_name: displayName,
          bio,
          specialties
        });

        toast({
          title: "Profil zaktualizowany",
          description: "Twoje zmiany zostały zapisane"
        });
      }

      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać profilu",
        variant: "destructive"
      });
    }
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  if (!user) return null;

  const isClient = user.role === 'client';
  const isTrainer = user.role === 'trainer';

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Edytuj profil</h1>
          </div>
          <Button onClick={handleSave}>Zapisz</Button>
        </div>
      </header>

      {loading ? (
        <div className="p-4">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Ładowanie...</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {isClient && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Zdjęcie profilowe</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplePhotoUploader
                    currentPhoto={avatarUrl}
                    onPhotoUploaded={setAvatarUrl}
                    userId={user.id}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Podstawowe informacje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Imię</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Twoje imię"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surname">Nazwisko</Label>
                    <Input
                      id="surname"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      placeholder="Twoje nazwisko"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Miasto</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Twoje miasto"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Język aplikacji</CardTitle>
                </CardHeader>
                <CardContent>
                  <InterfaceLanguageSelector />
                </CardContent>
              </Card>
            </>
          )}

          {isTrainer && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Podstawowe informacje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nazwa wyświetlana</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jak chcesz być wyświetlany?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Opowiedz o sobie..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Specjalizacje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <div
                        key={specialty}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">{specialty}</span>
                        <button
                          onClick={() => handleRemoveSpecialty(specialty)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Dodaj specjalizację..."
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialty()}
                    />
                    <Button onClick={handleAddSpecialty} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      <BottomNavigation 
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};
