"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import {
  Camera,
  XCircle,
  Video,
  Calendar,
  MapPin,
  Phone,
  ArrowLeft,
  CheckCircle2,
  MessageCircleWarning,
} from "lucide-react";

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

export default function SearchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [person, setPerson] = useState<PersonPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const id = params?.id;
  const wsUrl = API_URL.replace(/^http/, "ws") + `/ws/${id}`;
  const [founded, setFounded] = useState<FoundedPayload | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPerson = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/person/${id}`);
        setPerson(data as PersonPayload);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
  }, [id, API_URL]);

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

      if (!id) return;

      const ws = new WebSocket(wsUrl);
      setWsConnection(ws);

      ws.onopen = () => console.log("WebSocket connected");
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(data, "data");
          if (data.error) {
            console.error("WebSocket error:", data.error);
            return;
          }
          if (data.matched) {
            setFounded(data);
            console.log(
              `✅ MATCH FOUND: ${data.name} (${data.similarity.toFixed(
                2
              )}), bbox:${data}`
            );
          }
          console.log(
            `✅ MATCH FOUND: ${data.name} (${data.similarity.toFixed(
              2
            )}), bbox:${data}`
          );
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };
      ws.onclose = (event) => {
        console.log("WebSocket disconnected", event.code, event.reason);
        if (event.code !== 1000) {
          console.log("Unexpected disconnection, attempting reconnect...");
        }
      };
      ws.onerror = (err) => console.log("WebSocket error:", err);

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const context = canvas.getContext("2d");
      if (!context) {
        console.error("Canvas 2D context is not available");
        return;
      }

      intervalRef.current = setInterval(() => {
        if (!videoRef.current || ws.readyState !== WebSocket.OPEN) return;

        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        ws.send(JSON.stringify({ frame: dataUrl }));
      }, 500);
    } catch (err) {
      console.error("Camera error", err);
      alert("Камерад хандах боломжгүй байна");
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.error(err));
    }
  }, [isCameraActive]);

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
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Уншиж байна...</p>
        </div>
      </div>
    );
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
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} />

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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Бодит цагийн камера
              </h2>
              {!isCameraActive ? (
                <Button
                  onClick={startCamera}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Camera className="h-4 w-4 mr-2" /> Камера эхлүүлэх
                </Button>
              ) : (
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" /> Камера зогсоох
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-2xl font-bold text-foreground">
              Алга болсон хүний мэдээлэл
            </h2>

            <div className="bg-card rounded-xl border border-border p-6">
              {person ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    {person.img && (
                      <img
                        src={person.img}
                        alt={person.name}
                        className="w-20 h-20 rounded-xl object-cover border border-border"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xl font-semibold truncate">
                            {person.name}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                              Нас {person.age}
                            </span>
                          </div>
                        </div>
                        {person.phone_number && (
                          <Button
                            asChild
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <a href={`tel:${person.phone_number}`}>
                              <Phone className="h-4 w-4 mr-1" /> Дуудах
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-muted-foreground">
                          Сүүлд харагдсан огноо
                        </div>
                        <div className="font-medium">
                          {person.last_seen_data || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-muted-foreground">
                          Сүүлд харагдсан газар
                        </div>
                        <div className="font-medium">
                          {person.last_seen_location || "-"}
                        </div>
                      </div>
                    </div>
                    {person.phone_number && (
                      <div className="flex items-start gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-muted-foreground">Утас</div>
                          <div className="font-medium">
                            {person.phone_number}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {person.add_info && (
                    <div className="pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground mb-1">
                        Нэмэлт мэдээлэл
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {person.add_info}
                      </div>
                    </div>
                  )}
                  {founded?.matched ? (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-green-800">
                                Хайж буй хүн олдсон
                              </div>
                              <div className="text-xs text-green-700 mt-0.5 truncate">
                                {founded?.name || person.name} {founded?.bbox}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="w-full h-2 rounded-full bg-white/70">
                              <div
                                className="h-2 rounded-full bg-green-600"
                                style={{
                                  width: `${Math.round(
                                    (founded?.similarity ?? 0) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <div className="mt-2 text-xs text-green-800">
                              Ижил төстэй байдал{" "}
                              {Math.round((founded?.similarity ?? 0) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <MessageCircleWarning className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold ">
                                Хайж буй хүн одоогоор олдоогүй байна
                              </div>
                              <div className="text-xs  mt-0.5 truncate">
                                {founded?.name || person.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Хүний мэдээлэл олдсонгүй.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
