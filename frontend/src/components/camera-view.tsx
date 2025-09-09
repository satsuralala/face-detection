"use client";
import { useEffect, useRef } from "react";
import type React from "react";

import { Video } from "lucide-react";

interface FoundedPayload {
  matched?: boolean;
  similarity?: number;
  name?: string;
  bbox?: [number, number, number, number];
}

interface CameraViewProps {
  isCameraActive: boolean;
  founded: FoundedPayload | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function CameraView({
  isCameraActive,
  founded,
  videoRef,
}: CameraViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawBoundingBox = (bbox: [number, number, number, number]) => {
    const canvas = canvasRef.current;
    const video = videoRef?.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding box
    const [x1, y1, x2, y2] = bbox;
    const width = x2 - x1;
    const height = y2 - y1;

    ctx.strokeStyle = "#10b981"; // Green color
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, width, height);

    // Add label background
    ctx.fillStyle = "#10b981";
    ctx.fillRect(x1, y1 - 25, width, 25);

    // Add label text
    ctx.fillStyle = "white";
    ctx.font = "14px sans-serif";
    ctx.fillText(
      `${founded?.name || "Detected"} (${Math.round(
        (founded?.similarity || 0) * 100
      )}%)`,
      x1 + 5,
      y1 - 8
    );
  };

  useEffect(() => {
    if (founded?.matched && founded.bbox) {
      drawBoundingBox(founded.bbox);
    } else if (canvasRef.current) {
      // Clear canvas if no match
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [founded]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="aspect-video bg-muted flex items-center justify-center relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 10 }}
        />

        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Камера идэвхгүй
            </p>
            <p className="text-sm text-muted-foreground">
              Камераа идэвхжүүлнэ үү
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
