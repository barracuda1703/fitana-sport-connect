import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { reviewsService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerId: string;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({ isOpen, onClose, trainerId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      if (!isOpen || !trainerId) return;

      try {
        setLoading(true);
        const data = await reviewsService.getByTrainerId(trainerId);
        setReviews(data || []);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [isOpen, trainerId]);

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    try {
      await reviewsService.addTrainerReply(reviewId, replyText.trim());
      
      toast({
        title: "Odpowiedź dodana",
        description: "Twoja odpowiedź została opublikowana"
      });

      const updatedReviews = await reviewsService.getByTrainerId(trainerId);
      setReviews(updatedReviews || []);
      setReplyText('');
      setReplyingToId(null);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać odpowiedzi",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'fill-warning text-warning' : 'text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" />
            Opinie klientów
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Ładowanie opinii...</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Brak opinii</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">
                        {review.client?.name || 'Klient'}
                      </h4>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}

                  {review.trainer_reply && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs font-medium mb-1">Twoja odpowiedź:</p>
                      <p className="text-sm">{review.trainer_reply.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.trainer_reply.repliedAt).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                  )}

                  {!review.trainer_reply && user?.role === 'trainer' && (
                    <>
                      {replyingToId === review.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Napisz odpowiedź..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingToId(null);
                                setReplyText('');
                              }}
                            >
                              Anuluj
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSubmitReply(review.id)}
                            >
                              Wyślij odpowiedź
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReplyingToId(review.id)}
                        >
                          Odpowiedz na opinię
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
