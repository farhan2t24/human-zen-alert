import { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { Loader2, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";

interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

interface WebcamFeedProps {
  onEmotionDetected: (data: EmotionData) => void;
  onFearDetected: (confidence: number) => void;
  onManualSOSEnabled: (enabled: boolean) => void;
}

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

export const WebcamFeed = ({ onEmotionDetected, onFearDetected, onManualSOSEnabled }: WebcamFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      toast.success("Models loaded successfully!");
    } catch (error) {
      console.error("Error loading models:", error);
      toast.error("Failed to load face detection models");
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    if (!modelsLoaded) {
      toast.error("Models are still loading, please wait...");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        toast.success("Camera started");
        startDetection();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
    setIsStreaming(false);
    toast.info("Camera stopped");
  };

  const startDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }

    detectionInterval.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections) {
          const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const resizedDetections = faceapi.resizeResults(detections, dims);

          // Clear canvas
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }

          // Draw detections
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections, 0.05);

          // Get dominant emotion
          const expressions = detections.expressions;
          const emotionEntries = Object.entries(expressions);
          const [dominantEmotion, confidence] = emotionEntries.reduce((max, curr) =>
            curr[1] > max[1] ? curr : max
          );

          onEmotionDetected({
            emotion: dominantEmotion,
            confidence: confidence * 100,
            timestamp: new Date(),
          });

          // Check for fear
          if (dominantEmotion === "fearful" && confidence >= 0.6) {
            onFearDetected(confidence);
          } else {
            onFearDetected(0); // Reset fear tracking
          }

          // Check for manual SOS eligibility (sad, fearful, or surprised with >= 50% confidence)
          const shouldEnableManualSOS = 
            (dominantEmotion === "sad" || dominantEmotion === "fearful" || dominantEmotion === "surprised") 
            && confidence >= 0.5;
          onManualSOSEnabled(shouldEnableManualSOS);
        }
      }
    }, 500);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="640"
          height="480"
          className="block bg-muted"
        />
        <canvas ref={canvasRef} className="absolute top-0 left-0" />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
            <div className="text-center space-y-2">
              <Video className="w-16 h-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Camera not started</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!isStreaming ? (
          <Button
            onClick={startCamera}
            disabled={isLoading || !modelsLoaded}
            size="lg"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading Models...
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                Start Camera
              </>
            )}
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="destructive" size="lg" className="gap-2">
            <VideoOff className="w-5 h-5" />
            Stop Camera
          </Button>
        )}
      </div>
    </div>
  );
};
