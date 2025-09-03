"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/src/components/header";
import {
  Camera,
  XCircle,
  Video,
  User,
  Calendar,
  MapPin,
  Phone,
  ArrowLeft,
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

export default function SearchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [person, setPerson] = useState<PersonPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    const fetchPerson = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const { data } = await axios.get(`${API_URL}/person/${id}`);
        setPerson(data as PersonPayload);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
  }, [params]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error", err);
      alert("Камерад хандах боломжгүй байна");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
  };

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
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/search")}
          className="mb-6 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Буцах
        </Button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Camera */}
          <div className="space-y-4">
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

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Хүний мэдээлэл
            </h2>

            <div className="bg-card rounded-xl border border-border p-6">
              {person ? (
                <div className="flex items-start space-x-4">
                  {person.img && (
                    <img
                      src={person.img}
                      alt={person.name}
                      className="w-24 h-24 rounded-lg object-cover border-2 border-green-200"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-2xl font-bold mb-2">{person.name}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Нас:</span>
                        <span className="font-medium">{person.age}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Сүүлд харагдсан:
                        </span>
                        <span className="font-medium">
                          {person.last_seen_data}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Газар:</span>
                        <span className="font-medium">
                          {person.last_seen_location}
                        </span>
                      </div>
                      {person.phone_number && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Утас:</span>
                          <span className="font-medium">
                            {person.phone_number}
                          </span>
                        </div>
                      )}
                    </div>
                    {person.add_info && (
                      <div className="pt-4 text-sm">
                        <div className="text-muted-foreground mb-1">
                          Нэмэлт мэдээлэл:
                        </div>
                        <div>{person.add_info}</div>
                      </div>
                    )}
                  </div>
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
