import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, AlertTriangle } from "lucide-react";

interface LogEntry {
  type: "emotion" | "alert";
  emotion?: string;
  confidence?: number;
  timestamp: Date;
  message: string;
}

interface EventLogProps {
  entries: LogEntry[];
}

export const EventLog = ({ entries }: EventLogProps) => {
  return (
    <Card className="w-full max-w-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Event Log</h3>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No events yet. Start the camera to begin detection.
            </p>
          ) : (
            entries.map((entry, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-sm animate-fade-in"
              >
                {entry.type === "alert" && (
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-foreground">{entry.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {entry.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export type { LogEntry };
