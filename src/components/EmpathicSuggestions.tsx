import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

interface EmpathicSuggestionsProps {
  emotion: string;
}

const suggestions: Record<string, string> = {
  sad: "You look tired, maybe take a short break 🌿",
  angry: "Take a deep breath 💨",
  happy: "Keep smiling, it's contagious 😄",
  fearful: "Stay calm, help is here if needed 🧡",
  surprised: "Looks like something caught your eye 👀",
  neutral: "All good, stay relaxed 😊",
  disgusted: "Something bothering you? Take a moment for yourself 🌸",
};

export const EmpathicSuggestions = ({ emotion }: EmpathicSuggestionsProps) => {
  const message = suggestions[emotion] || suggestions.neutral;

  return (
    <Card className="p-4 w-full max-w-2xl bg-primary/5 border-primary/20 animate-fade-in">
      <div className="flex items-center gap-3">
        <Heart className="w-5 h-5 text-primary animate-pulse-soft" />
        <p className="text-sm text-foreground/80 italic">{message}</p>
      </div>
    </Card>
  );
};
