"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Search, Users, Clock, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import UploadModal from "../components/upload-modal";
import { fetchAllPersons, Person } from "../lib/api";

interface UserInfo {
  userId: string | null;
  userRole: string | null;
  loginTime: string | null;
}

const mapPersonToDisplay = (person: Person) => ({
  id: person._id,
  name: person.name,
  age: parseInt(person.age) || 0,
  lastSeen: person.last_seen_data,
  location: person.last_seen_location,
  image: person.img,
  status: "Хайж байна",
  phone: person.phone_number,
  additionalInfo: person.add_info,
});

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [persons, setPersons] = useState<
    ReturnType<typeof mapPersonToDisplay>[]
  >([]);
  const [personsLoading, setPersonsLoading] = useState(false);
  const [personsError, setPersonsError] = useState<string | null>(null);
  const router = useRouter();

  const loadPersons = async () => {
    setPersonsLoading(true);
    setPersonsError(null);
    try {
      const apiPersons = await fetchAllPersons();
      const mappedPersons = apiPersons.map(mapPersonToDisplay);
      setPersons(mappedPersons);
    } catch (error) {
      console.error("Failed to load persons:", error);
      setPersonsError("Хүмүүсийн мэдээллийг ачаалахад алдаа гарлаа");
    } finally {
      setPersonsLoading(false);
    }
  };

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");

    if (!authStatus) {
      router.push("/auth/signin");
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);

    loadPersons();
  }, [router]);

  const handleFindLostPerson = () => {
    setIsUploadModalOpen(true);
  };

  const handleAddNewPerson = () => {
    setIsUploadModalOpen(true);
  };

  const handleModalClose = () => {
    setIsUploadModalOpen(false);

    loadPersons();
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
                Нийт: {persons.length} хүн
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

          {personsError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{personsError}</p>
              <Button
                onClick={loadPersons}
                size="sm"
                className="mt-2 bg-red-600 hover:bg-red-700"
              >
                Дахин оролдох
              </Button>
            </div>
          )}

          {personsLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Хүмүүсийн мэдээллийг ачаалж байна...
              </p>
            </div>
          ) : persons.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground mb-2">
                Одоогоор хүн бүртгэгдээгүй байна
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Эхний хүнийг бүртгэхийн тулд Шинэ хүн товчийг дарна уу
              </p>
              <Button
                onClick={handleAddNewPerson}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Анхны хүнийг нэмэх
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {persons.map((person) => (
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
                      {person.phone && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Утас: {person.phone}
                        </p>
                      )}
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
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Search className="h-8 w-8 text-green-600" />
              <div className="text-3xl font-bold text-green-600">
                {persons.length}
              </div>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Нийт хүн
            </div>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Clock className="h-8 w-8 text-amber-600" />
              <div className="text-3xl font-bold text-amber-600">
                {persons.filter((p) => p.status === "Хайж байна").length}
              </div>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Хайж байгаа
            </div>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Users className="h-8 w-8 text-green-600" />
              <div className="text-3xl font-bold text-green-600">
                {persons.filter((p) => p.status === "Олдсон").length}
              </div>
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
          </div>
        </div>
      </main>
      <UploadModal isOpen={isUploadModalOpen} onClose={handleModalClose} />
    </div>
  );
}
