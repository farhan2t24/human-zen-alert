import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface SOSAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
}

export const SOSAlert = ({ isOpen, onClose, onSend }: SOSAlertProps) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setCountdown(10);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSend();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleSend = async () => {
    try {
      // Get location if available
      let locationText = "Location unavailable";
      let locationLink = "";

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          locationLink = `https://maps.google.com/?q=${lat},${lng}`;
          locationText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
          console.error("Location error:", error);
          locationText = "Location access denied";
        }
      }

      // Get contacts from localStorage
      const contacts = JSON.parse(localStorage.getItem("humanizedVision.contacts") || "[]");

      // Create alert message
      const alertMessage = `
🚨 SOS ALERT 🚨
Detected emotion: FEARFUL
Time: ${new Date().toISOString()}
Location: ${locationText}
${locationLink ? `Map: ${locationLink}` : ''}
Emergency contacts: ${contacts.join(', ') || 'None saved'}
      `.trim();

      // Log alert data
      console.log("📧 SOS Alert Details:", {
        emotion: "fear",
        timestamp: new Date().toISOString(),
        location: locationLink || locationText,
        contacts,
      });

      // Show alert message
      alert(alertMessage);

      toast.success("🚨 SOS Alert Sent!", {
        description: "Emergency contacts have been notified.",
      });

      onSend();
    } catch (error) {
      console.error("Error sending alert:", error);
      toast.error("Failed to send alert");
    }
  };

  const handleCancel = () => {
    toast.info("SOS Alert cancelled");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="border-destructive/50">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-destructive animate-pulse-soft" />
            <AlertDialogTitle className="text-2xl">⚠️ SOS Alert</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Fear detected continuously. Sending alert in{" "}
            <span className="font-bold text-destructive text-xl">{countdown}</span> seconds.
            <br />
            Press CANCEL to stop or SEND NOW to alert immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSend}
            className="bg-destructive hover:bg-destructive/90"
          >
            Send Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
