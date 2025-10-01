import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationPermissionModalProps {
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export const LocationPermissionModal = ({
  open,
  onAllow,
  onDeny,
}: LocationPermissionModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDeny()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">
            Udostępnij swoją lokalizację
          </DialogTitle>
          <DialogDescription className="text-center">
            Aby pokazać Ci trenerów w Twojej okolicy i posortować ich według odległości, 
            potrzebujemy dostępu do Twojej lokalizacji. Możesz to zmienić w każdej chwili.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onDeny} className="w-full">
            Nie teraz
          </Button>
          <Button onClick={onAllow} className="w-full">
            Udostępnij lokalizację
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
