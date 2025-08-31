"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Search, Users, Clock, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/header";
import UploadModal from "../components/upload-modal";

interface UserInfo {
  userId: string | null;
  userRole: string | null;
  loginTime: string | null;
}

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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
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
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="flex flex-col justify-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-6 text-balance leading-tight">
                FindHope
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
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <Video className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Бодит цагийн видео хяналт
                </h3>
              </div>
            </div>
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="text-center">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Видео хяналт идэвхгүй
                </p>
                <p className="text-sm text-muted-foreground">
                  Системийг эхлүүлэхийн тулд товчийг дарна уу
                </p>
                <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                  Видео хяналт эхлүүлэх
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-card-foreground">
              Оруулсан хүмүүсийн жагсаалт
            </h3>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-muted-foreground bg-green-50 px-3 py-1 rounded-full border border-green-200">
                Нийт: {mockUploadedPersons.length} хүн
              </div>
              <Button
                onClick={handleAddNewPerson}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Шинэ хүн
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockUploadedPersons.map((person) => (
              <div
                key={person.id}
                className="p-6 bg-background rounded-lg border border-border hover:shadow-md hover:border-green-200 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={person.image || "/placeholder.svg"}
                    alt={person.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Search className="h-8 w-8 text-green-600" />
              <div className="text-3xl font-bold text-green-600">0</div>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Нийт хайлт
            </div>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Clock className="h-8 w-8 text-amber-600" />
              <div className="text-3xl font-bold text-amber-600">0</div>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Идэвхтэй хайлт
            </div>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Users className="h-8 w-8 text-green-600" />
              <div className="text-3xl font-bold text-green-600">0</div>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Олдсон хүмүүс
            </div>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="text-3xl font-bold text-red-600">0</div>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Системийн алерт
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          <h3 className="text-2xl font-semibold mb-6 text-card-foreground">
            Сүүлийн үйл ажиллагаа
          </h3>
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
        </div>
      </main>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
