import { useState, useRef, useEffect } from "react";
import { WebcamFeed } from "@/components/WebcamFeed";
import { EmotionDisplay } from "@/components/EmotionDisplay";
import { EmpathicSuggestions } from "@/components/EmpathicSuggestions";
import { SOSAlert } from "@/components/SOSAlert";
import { ContactsManager } from "@/components/ContactsManager";
import { EventLog, LogEntry } from "@/components/EventLog";
import { Brain } from "lucide-react";

const Index = () => {
  const [currentEmotion, setCurrentEmotion] = useState({ emotion: "neutral", confidence: 0 });
  const [showSOSAlert, setShowSOSAlert] = useState(false);
  const [eventLog, setEventLog] = useState<LogEntry[]>([]);
  
  const fearStartTime = useRef<number | null>(null);
  const lastLoggedEmotion = useRef<string>("");

  useEffect(() => {
    document.title = "Humanized Vision – Real-Time Emotion Detector";
  }, []);

  const handleEmotionDetected = (data: { emotion: string; confidence: number; timestamp: Date }) => {
    setCurrentEmotion(data);

    // Only log significant emotion changes to avoid spam
    if (data.emotion !== lastLoggedEmotion.current && data.confidence > 60) {
      lastLoggedEmotion.current = data.emotion;
      addLogEntry({
        type: "emotion",
        emotion: data.emotion,
        confidence: data.confidence,
        timestamp: data.timestamp,
        message: `Detected ${data.emotion} with ${data.confidence.toFixed(1)}% confidence`,
      });
    }
  };

  const handleFearDetected = (confidence: number) => {
    if (confidence >= 0.6) {
      if (fearStartTime.current === null) {
        fearStartTime.current = Date.now();
      } else {
        const duration = Date.now() - fearStartTime.current;
        if (duration >= 2000 && !showSOSAlert) {
          // Fear sustained for 2+ seconds
          setShowSOSAlert(true);
          addLogEntry({
            type: "alert",
            timestamp: new Date(),
            message: "⚠️ SOS Alert triggered - sustained fear detected",
          });
        }
      }
    } else {
      fearStartTime.current = null;
    }
  };

  const addLogEntry = (entry: LogEntry) => {
    setEventLog((prev) => [entry, ...prev].slice(0, 20)); // Keep last 20 entries
  };

  const handleSOSSend = () => {
    setShowSOSAlert(false);
    fearStartTime.current = null;
    addLogEntry({
      type: "alert",
      timestamp: new Date(),
      message: "🚨 SOS Alert sent to emergency contacts",
    });
  };

  const handleSOSClose = () => {
    setShowSOSAlert(false);
    fearStartTime.current = null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Humanized Vision</h1>
                <p className="text-sm text-muted-foreground">Real-Time Emotion Detector & SOS</p>
              </div>
            </div>
            <ContactsManager />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Webcam Feed */}
          <WebcamFeed
            onEmotionDetected={handleEmotionDetected}
            onFearDetected={handleFearDetected}
          />

          {/* Emotion Display */}
          {currentEmotion.confidence > 0 && (
            <>
              <EmotionDisplay
                emotion={currentEmotion.emotion}
                confidence={currentEmotion.confidence}
              />
              <EmpathicSuggestions emotion={currentEmotion.emotion} />
            </>
          )}

          {/* Event Log */}
          <EventLog entries={eventLog} />
        </div>
      </main>

      {/* SOS Alert Dialog */}
      <SOSAlert isOpen={showSOSAlert} onClose={handleSOSClose} onSend={handleSOSSend} />

      {/* Footer */}
      <footer className="border-t bg-card/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Your privacy matters. All detection happens locally in your browser. No images are stored or transmitted.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
