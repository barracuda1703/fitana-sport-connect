import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Service } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().trim().min(1, "Nazwa usługi jest wymagana").max(100, "Nazwa nie może być dłuższa niż 100 znaków"),
  description: z.string().trim().min(1, "Opis jest wymagany").max(500, "Opis nie może być dłuższy niż 500 znaków"),
  price: z.number().min(1, "Cena musi być większa niż 0").max(10000, "Cena nie może być większa niż 10000 PLN"),
  duration: z.number().min(15, "Czas trwania musi być co najmniej 15 minut").max(300, "Czas trowania nie może przekraczać 300 minut"),
  type: z.union([z.literal("online"), z.literal("gym"), z.literal("court"), z.literal("home_visit")])
});

interface ServiceManagementModalProps {
  onAddService: (service: Omit<Service, 'id'>) => void;
}

export const ServiceManagementModal: React.FC<ServiceManagementModalProps> = ({ onAddService }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    type: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const getTypeLabel = (type: string) => {
    const labels = {
      online: "Online",
      gym: "Siłownia",
      court: "Boisko/Kort",
      home_visit: "Wizyta domowa"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Basic validation first
    if (!formData.type) {
      setErrors({ type: "Typ usługi jest wymagany" });
      return;
    }
    
    try {
      const validatedData = serviceSchema.parse({
        name: formData.name,
        description: formData.description || "Brak opisu",
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        type: formData.type
      });

      const newService: Omit<Service, 'id'> = {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        duration: validatedData.duration,
        type: validatedData.type,
        currency: "PLN"
      };

      onAddService(newService);
      setFormData({ name: "", description: "", price: "", duration: "", type: "" });
      setErrors({});
      setOpen(false);
      
      toast({
        title: "Usługa dodana",
        description: "Nowa usługa została pomyślnie dodana do Twojej oferty.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj nową usługę
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dodaj nową usługę</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nazwa usługi</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="np. Trening boksu indywidualny"
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Krótki opis usługi..."
              rows={3}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Cena (PLN)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="90"
              />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
            </div>

            <div>
              <Label htmlFor="duration">Czas trwania (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="60"
              />
              {errors.duration && <p className="text-sm text-destructive mt-1">{errors.duration}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="type">Typ usługi</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ usługi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="gym">Siłownia</SelectItem>
                <SelectItem value="court">Boisko/Kort</SelectItem>
                <SelectItem value="home_visit">Wizyta domowa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive mt-1">{errors.type}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button type="submit">
              Zapisz usługę
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};