"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Search, Users, Clock, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Image from "next/image";
import UploadModal from "../components/upload-modal";

const mockUploadedPersons = [
  {
    id: 1,
    name: "Батбаяр",
    age: 25,
    lastSeen: "2024-01-15",
    location: "Улаанбаатар хот",
    image: "/mongolian-man-portrait.png",
    status: "Хайж байна",
  },
  {
    id: 2,
    name: "Сарангэрэл",
    age: 32,
    lastSeen: "2024-01-10",
    location: "Дархан хот",
    image: "/mongolian-woman-portrait.png",
    status: "Хайж байна",
  },
  {
    id: 3,
    name: "Төмөрбаатар",
    age: 45,
    lastSeen: "2024-01-08",
    location: "Эрдэнэт хот",
    image: "/mongolian-middle-aged-man-portrait.png",
    status: "Олдсон",
  },
];

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");

    if (!authStatus) {
      router.push("/auth/signin");
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  const handleFindLostPerson = () => {
    setIsUploadModalOpen(true);
  };

  const handleAddNewPerson = () => {
    setIsUploadModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="flex flex-col justify-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-6 text-balance leading-tight">
                Hope
              </h1>
              <p className="text-xl text-muted-foreground mb-6 text-pretty leading-relaxed">
                Хиймэл оюун ухаанаар алга болсон хүмүүсийг илрүүлэх платформ
              </p>
              <p className="text-lg text-muted-foreground mb-8 text-pretty">
                Бид гэр бүлүүдэд хайрт хүмүүсээ олоход нь туслах зорилготой
              </p>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleFindLostPerson}
                    size="lg"
                    aria-label="Алга болсон хүн хайх"
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  >
                    <Search className="h-6 w-6 mr-3" />
                    Алга болсон хүн хайх
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Зураг оруулж, видеоноос хайж, олох үйл явц
                </p>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <Video className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-card-foreground">
                  Real-Time Видео Хяналт
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center">
                  <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Видео эхлүүлэх
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Системийг эхлүүлэхийн тулд доорх товчийг дарна уу
                  </p>
                  <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
                    Видео эхлүүлэх
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="hover:shadow-lg transition-shadow duration-300 mb-16">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Оруулсан хүмүүсийн жагсаалт
              </CardTitle>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-muted-foreground bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  Нийт: {mockUploadedPersons.length} хүн
                </div>
                <Button
                  onClick={handleAddNewPerson}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Шинэ хүн
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockUploadedPersons.map((person) => (
                <div
                  key={person.id}
                  className="p-6 bg-background rounded-lg border border-border hover:shadow-md hover:border-green-200 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <Image
                      src={person.image || "/placeholder.svg"}
                      alt={person.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover border-2 border-green-200"
                      loading="lazy"
                      sizes="64px"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-foreground mb-1">
                        {person.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        Нас: {person.age}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Сүүлд харагдсан: {person.lastSeen}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {person.location}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            person.status === "Олдсон"
                              ? "bg-green-500"
                              : "bg-amber-500"
                          }`}
                        ></div>
                        <span
                          className={`text-xs font-medium ${
                            person.status === "Олдсон"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {person.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Search className="h-8 w-8 text-green-600" />
                <div className="text-3xl font-bold text-green-600">0</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Нийт хайлт
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Clock className="h-8 w-8 text-amber-600" />
                <div className="text-3xl font-bold text-amber-600">0</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Идэвхтэй хайлт
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Users className="h-8 w-8 text-green-600" />
                <div className="text-3xl font-bold text-green-600">0</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Олдсон хүмүүс
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="text-3xl font-bold text-red-600">0</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Системийн алерт
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="p-0">
          <CardHeader>
            <CardTitle className="text-2xl">Сүүлийн үйл ажиллагаа</CardTitle>
            <CardDescription>
              Таны хийсэн үйлдлүүд энд харагдана.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground mb-2">
                Одоогоор үйл ажиллагаа байхгүй байна
              </p>
              <p className="text-sm text-muted-foreground">
                Системийг ашиглаж эхлэхэд энд мэдээлэл харагдана
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
