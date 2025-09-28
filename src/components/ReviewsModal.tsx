import React, { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { dataStore, Review } from '@/services/DataStore';
import { useToast } from '@/hooks/use-toast';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerId: string;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({ isOpen, onClose, trainerId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (isOpen && trainerId) {
      const trainerReviews = dataStore.getReviews(trainerId);
      setReviews(trainerReviews);
    }
  }, [isOpen, trainerId]);

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    const updatedReview = dataStore.addTrainerReply(reviewId, replyText.trim());
    if (updatedReview) {
      setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
      setReplyText('');
      setReplyingTo(null);
      toast({
        title: "Odpowiedź dodana",
        description: "Twoja odpowiedź została pomyślnie dodana do opinii.",
      });
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
      />
    ));
  };

  const getClientName = (clientId: string) => {
    // Mock client names based on ID
    const names: { [key: string]: string } = {
      'u-client1': 'Marcin K.',
      'u-client2': 'Agata S.',
      'u-client3': 'Tomasz L.'
    };
    return names[clientId] || `Klient ${clientId.slice(-4)}`;
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Opinie klientów</span>
            <Badge variant="secondary" className="bg-warning/20 text-warning">
              ⭐ {averageRating} ({reviews.length} opinii)
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <Card key={review.id} className="bg-gradient-card">
                <CardContent className="p-4">
                  {/* Review Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{getClientName(review.clientId)}</span>
                      <div className="flex gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('pl-PL')}
                    </span>
                  </div>

                  {/* Review Comment */}
                  <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>

                  {/* Photos */}
                  {review.photos.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.photos.map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={photo}
                          alt="Review photo"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {/* Trainer Reply */}
                  {review.trainerReply && (
                    <div className="bg-primary/5 rounded-lg p-3 mt-3 border-l-2 border-primary">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">Odpowiedź trenera</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.trainerReply.repliedAt).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                      <p className="text-sm">{review.trainerReply.comment}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {!review.trainerReply && user && (
                    <div className="mt-3">
                      {replyingTo === review.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Napisz odpowiedź na tę opinię..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSubmitReply(review.id)}
                              disabled={!replyText.trim()}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Wyślij odpowiedź
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                            >
                              Anuluj
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyingTo(review.id)}
                        >
                          Odpowiedz na opinię
                        </Button>
                      )}
                    </div>
                  )}

                  {index < reviews.length - 1 && <Separator className="mt-4" />}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-gradient-card">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Brak opinii</p>
                  <p className="text-sm mt-1">Gdy otrzymasz pierwsze opinie od klientów, pojawią się tutaj.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};