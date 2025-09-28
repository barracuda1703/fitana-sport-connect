import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowLeft, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataStore } from '@/services/DataStore';

interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'active' | 'inactive';
  lastTraining?: string;
  totalSessions: number;
  discipline: string;
}

export const ClientManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    // Mock client data - in real app would fetch from backend
    const mockClients: Client[] = [
      {
        id: 'u-client1',
        name: 'Kasia Nowak',
        email: 'kasia@example.com',
        avatar: '👩‍🦰',
        status: 'active',
        lastTraining: '2024-01-15',
        totalSessions: 15,
        discipline: 'Fitness'
      },
      {
        id: 'u-client2',
        name: 'Marek Kowalski',
        email: 'marek@example.com',
        avatar: '👨‍🦲',
        status: 'active',
        lastTraining: '2024-01-14',
        totalSessions: 8,
        discipline: 'Boks'
      },
      {
        id: 'u-client3',
        name: 'Anna Wiśniewska',
        email: 'anna@example.com',
        avatar: '👩‍🦱',
        status: 'inactive',
        lastTraining: '2024-01-10',
        totalSessions: 22,
        discipline: 'Yoga'
      }
    ];
    setClients(mockClients);
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMessageClient = (clientId: string) => {
    navigate(`/chat/chat-u-${clientId}-t-1`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/trainer')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Zarządzaj klientami</h1>
            <p className="text-muted-foreground">Lista Twoich klientów</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj klienta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszyscy</SelectItem>
              <SelectItem value="active">Aktywni</SelectItem>
              <SelectItem value="inactive">Nieaktywni</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Client List */}
      <section className="px-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Klienci ({filteredClients.length})
          </h2>
        </div>

        {filteredClients.length > 0 ? (
          <div className="space-y-3">
            {filteredClients.map((client) => (
              <Card key={client.id} className="bg-gradient-card hover:shadow-card transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>{client.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status === 'active' ? 'Aktywny' : 'Nieaktywny'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {client.discipline}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{client.totalSessions}</div>
                      <div className="text-xs text-muted-foreground">treningów</div>
                      {client.lastTraining && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Ostatni: {new Date(client.lastTraining).toLocaleDateString('pl-PL')}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMessageClient(client.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak klientów spełniających kryteria wyszukiwania</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole="trainer"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};