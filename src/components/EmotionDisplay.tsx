import { Card } from "@/components/ui/card";
import { Smile, Frown, Angry, AlertTriangle, Sparkles, Meh, Annoyed } from "lucide-react";

interface EmotionDisplayProps {
  emotion: string;
  confidence: number;
}

const emotionConfig: Record<string, { icon: any; color: string; emoji: string }> = {
  happy: { icon: Smile, color: "text-[hsl(var(--emotion-happy))]", emoji: "😊" },
  sad: { icon: Frown, color: "text-[hsl(var(--emotion-sad))]", emoji: "😢" },
  angry: { icon: Angry, color: "text-[hsl(var(--emotion-angry))]", emoji: "😠" },
  fearful: { icon: AlertTriangle, color: "text-[hsl(var(--emotion-fearful))]", emoji: "😨" },
  surprised: { icon: Sparkles, color: "text-[hsl(var(--emotion-surprised))]", emoji: "😲" },
  neutral: { icon: Meh, color: "text-[hsl(var(--emotion-neutral))]", emoji: "😐" },
  disgusted: { icon: Annoyed, color: "text-[hsl(var(--emotion-disgusted))]", emoji: "🤢" },
};

export const EmotionDisplay = ({ emotion, confidence }: EmotionDisplayProps) => {
  const config = emotionConfig[emotion] || emotionConfig.neutral;
  const Icon = config.icon;

  return (
    <Card className="p-6 w-full max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`${config.color} bg-background p-3 rounded-full`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Detected Emotion</p>
            <h3 className="text-2xl font-bold capitalize flex items-center gap-2">
              {emotion} <span className="text-3xl">{config.emoji}</span>
            </h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground font-medium">Confidence</p>
          <p className={`text-3xl font-bold ${config.color}`}>{confidence.toFixed(2)}%</p>
        </div>
      </div>
      
      {/* Confidence bar */}
      <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${config.color} bg-current transition-all duration-300`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </Card>
  );
};
