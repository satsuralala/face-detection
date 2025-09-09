"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PersonInfo } from "@/src/components/person-info";
import { CameraView } from "@/src/components/camera-view";
import { CameraControls } from "@/src/components/camera-controls";
import { LoadingSpinner } from "@/src/components/loading-spinner";

interface PersonPayload {
  id?: string;
  _id?: string;
  name: string;
  age: string;
  last_seen_data: string;
  last_seen_location: string;
  phone_number: string;
  add_info: string;
  img: string;
}

interface FoundedPayload {
  matched?: boolean;
  similarity?: number;
  name?: string;
  bbox?: [number, number, number, number];
}

const mockPersonData: PersonPayload = {
  id: "1",
  name: "Satsural",
  age: "25",
  last_seen_data: "2024-01-15",
  last_seen_location: "Улаанбаатар хот, Сүхбаатар дүүрэг",
  phone_number: "+976 9999 9999",
  add_info:
    "Өндөр 170см, жин 65кг. Хар үстэй, хөх нүдтэй. Сүүлд цэнхэр өмд, цагаан цамц өмссөн байсан.",
  img: "/thoughtful-artist.png",
};

export default function SearchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [person, setPerson] = useState<PersonPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const id = params?.id;
  const wsUrl = API_URL.replace(/^http/, "ws") + `/ws/${id}`;
  const [founded, setFounded] = useState<FoundedPayload | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPerson = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setPerson(mockPersonData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
  }, [id]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }

      setTimeout(() => {
        const mockDetection: FoundedPayload = {
          matched: true,
          similarity: 0.68291584740638,
          name: "Satsural",
          bbox: [283, 185, 455, 405],
        };
        setFounded(mockDetection);
        console.log("✅ MOCK MATCH FOUND: Satsural (68.29%)");
      }, 3000);

      console.log("Mock WebSocket connected");
    } catch (err) {
      console.error("Camera error", err);
      alert("Камерад хандах боломжгүй байна");
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (wsConnection) {
      if (wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.close(1000, "User stopped camera");
      }
      setWsConnection(null);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setFounded(null);
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.error(err));
    }
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsConnection) {
        wsConnection.close(1000, "Component unmounted");
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [wsConnection]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/search")}
          className="mb-6 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Буцах
        </Button>
      </div>

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4 lg:col-span-2">
            <CameraView
              isCameraActive={isCameraActive}
              founded={founded}
              videoRef={videoRef}
            />
            <CameraControls
              isCameraActive={isCameraActive}
              onStartCamera={startCamera}
              onStopCamera={stopCamera}
            />
          </div>

          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-2xl font-bold text-foreground">
              Алга болсон хүний мэдээлэл
            </h2>
            <PersonInfo person={person} founded={founded} />
          </div>
        </div>
      </main>
    </div>
  );
}
