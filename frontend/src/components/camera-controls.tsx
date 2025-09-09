"use client";
import { Button } from "@/components/ui/button";
import { Camera, XCircle } from "lucide-react";

interface CameraControlsProps {
  isCameraActive: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
}

export function CameraControls({
  isCameraActive,
  onStartCamera,
  onStopCamera,
}: CameraControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-foreground">
        Бодит цагийн камера
      </h2>
      {!isCameraActive ? (
        <Button
          onClick={onStartCamera}
          className="bg-green-600 hover:bg-green-700"
        >
          <Camera className="h-4 w-4 mr-2" /> Камера эхлүүлэх
        </Button>
      ) : (
        <Button
          onClick={onStopCamera}
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
        >
          <XCircle className="h-4 w-4 mr-2" /> Камера зогсоох
        </Button>
      )}
    </div>
  );
}
