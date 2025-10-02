import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGoogleMapsContext } from "@/contexts/GoogleMapsContext";

interface GoogleMapsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const GoogleMapsErrorBoundary = ({ children, fallback }: GoogleMapsErrorBoundaryProps) => {
  const { isLoaded, error, isRetrying, retryCount, retryLoad } = useGoogleMapsContext();

  if (error && !isRetrying) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd ładowania map</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p className="text-sm">{error.message}</p>
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Próba {retryCount} z 3 nie powiodła się
              </p>
            )}
            <Button 
              onClick={retryLoad} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Spróbuj ponownie
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isRetrying) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Ponowne ładowanie map...</AlertTitle>
          <AlertDescription>
            Próba {retryCount} z 3
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Ładowanie map...</div>
      </div>
    );
  }

  return <>{children}</>;
};
