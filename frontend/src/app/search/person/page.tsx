"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Video,
  User,
  MapPin,
  Calendar,
  Phone,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../../../components/header";

interface PersonInfo {
  name: string;
  age: string;
  lastSeen: string;
  location: string;
  phone: string;
  description: string;
  image: File | null;
}

interface SearchResult {
  id: string;
  similarity: number;
  timestamp: string;
  location: string;
  confidence: "high" | "medium" | "low";
}

export default function PersonSearchPage() {
  const [personInfo, setPersonInfo] = useState<PersonInfo | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<
    "searching" | "found" | "not_found"
  >("searching");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load person info from localStorage
    const storedPerson = localStorage.getItem("searchingPerson");
    if (storedPerson) {
      try {
        const parsed = JSON.parse(storedPerson);
        setPersonInfo(parsed);
      } catch (error) {
        console.error("Error parsing person info:", error);
        router.push("/");
      }
    } else {
      router.push("/");
    }

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [router]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Камерад хандах боломжгүй байна");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startSearch = async () => {
    if (!isCameraActive) {
      alert("Эхлээд камераа идэвхжүүлнэ үү");
      return;
    }

    setIsSearching(true);
    setCurrentStatus("searching");

    try {
      // Simulate AI search process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate search results
      const mockResults: SearchResult[] = [
        {
          id: "1",
          similarity: 0.85,
          timestamp: new Date().toLocaleString(),
          location: "Камера 1 - Гол гудамж",
          confidence: "high",
        },
        {
          id: "2",
          similarity: 0.72,
          timestamp: new Date().toLocaleString(),
          location: "Камера 2 - Төв талбай",
          confidence: "medium",
        },
      ];

      setSearchResults(mockResults);

      // Determine if person was found
      if (mockResults.some((result) => result.confidence === "high")) {
        setCurrentStatus("found");
      } else {
        setCurrentStatus("not_found");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Хайлтын алдаа гарлаа");
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <CheckCircle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "low":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (!personInfo) {
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

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Буцах
        </Button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Side - Live Camera Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Бодит цагийн камера
              </h2>
              <div className="flex space-x-2">
                {!isCameraActive ? (
                  <Button
                    onClick={startCamera}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Камера эхлүүлэх
                  </Button>
                ) : (
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Камера зогсоох
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center relative">
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
                      Хайлт эхлүүлэхийн тулд камераа идэвхжүүлнэ үү
                    </p>
                  </div>
                )}

                {isSearching && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg font-medium">Хайлт хийж байна...</p>
                      <p className="text-sm opacity-90">
                        AI систем дүн шинжилгээ хийж байна
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border">
                <Button
                  onClick={startSearch}
                  disabled={!isCameraActive || isSearching}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  size="lg"
                >
                  <Search className="h-5 w-5 mr-2" />
                  {isSearching ? "Хайлт хийж байна..." : "Хайлт эхлүүлэх"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Person Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Хайж буй хүний мэдээлэл
            </h2>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start space-x-4 mb-6">
                {personInfo.image && (
                  <img
                    src={URL.createObjectURL(personInfo.image)}
                    alt={personInfo.name}
                    className="w-24 h-24 rounded-lg object-cover border-2 border-green-200"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {personInfo.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Нас:</span>
                      <span className="font-medium">{personInfo.age}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Сүүлд харагдсан:
                      </span>
                      <span className="font-medium">{personInfo.lastSeen}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Газр:</span>
                  <span className="font-medium">{personInfo.location}</span>
                </div>

                {personInfo.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Утас:</span>
                    <span className="font-medium">{personInfo.phone}</span>
                  </div>
                )}

                {personInfo.description && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">
                      Нэмэлт мэдээлэл:
                    </p>
                    <p className="text-sm">{personInfo.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Search Status */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Хайлтын төлөв
              </h3>

              {currentStatus === "searching" && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Хайлт хийгээгүй байна</p>
                </div>
              )}

              {currentStatus === "found" && (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-medium text-green-600 mb-1">
                    Хүн олдлоо!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Дэлгэрэнгүй мэдээллийг доор харна уу
                  </p>
                </div>
              )}

              {currentStatus === "not_found" && (
                <div className="text-center py-4">
                  <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                  <p className="text-lg font-medium text-red-600 mb-1">
                    Хүн олдсонгүй
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Хайлтыг дахин оролдоно уу
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-2xl font-semibold text-foreground mb-6">
              Хайлтын дүн
            </h3>

            <div className="space-y-4">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${getStatusColor(
                        result.confidence
                      )}`}
                    >
                      {getStatusIcon(result.confidence)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Ижил төстэй байдал:{" "}
                        {(result.similarity * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.location} • {result.timestamp}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        result.confidence
                      )}`}
                    >
                      {result.confidence === "high"
                        ? "Өндөр"
                        : result.confidence === "medium"
                        ? "Дунд"
                        : "Бага"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
