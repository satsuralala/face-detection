"use client";
import { Shield, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignIn() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim() || !password.trim()) {
      toast("Мэдээлэл дутуу байна", {
        description: "ID болон нууц үгээ бүрэн оруулна уу",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (id === "12345678" && password === "password") {
        localStorage.setItem("isAuthenticated", "true");

        toast.success("Амжилттай нэвтэрлээ!");

        router.push("/");
      } else {
        toast.error("Мэдээлэл буруу байна", {
          description: "ID эсвэл нууц үг буруу байна, дахин оролдоно уу",
        });
      }
    } catch (error) {
      toast.error("Алдаа гарлаа", {
        description: "Системийн алдаа гарлаа, дахин оролдоно уу",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield color="green" className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">FindHope</h1>
          </div>
          <p className="text-muted-foreground">
            AI ашиглан алга болсон хүмүүсийг олох зориулалттай веб портал
          </p>
        </div>

        <Card className="bg-gray-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Нэвтрэх</CardTitle>
            <CardDescription>
              Өөрийн зөвшөөрөгдсөн хэрэглэгчийн мэдээллээр нэвтэрнэ үү
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">
                  Албан хаагчийн ID/Албан хаагчийн EMAIL
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="id"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="ID дугаараа оруулна уу"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Нууц үг</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Нууц үгээ оруулна уу"
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-800 hover:bg-green-700"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Нэвтэрч байна...</span>
                  </div>
                ) : (
                  "Нэвтрэх"
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                <p className="text-green-600">Нууц үгээ мартсан уу?</p>
              </Link>
              <p className="text-xs text-muted-foreground">
                Хандалт хэрэгтэй бол веб порталын администратортой холбоо барина
                уу
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-card/50 rounded-lg border border-border">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">
                Аюулгүй байдлын мэдэгдэл
              </p>
              <p className="text-muted-foreground">
                Энэхүү систем зөвхөн албаар зөвшөөрөгдсөн хэрэглэгчдэд
                зориулагдсан бөгөөд бүх нэвтрэх оролдлогыг бүртгэж, хяналтанд
                авдаг. Алга болсон хүмүүсийг олоход AI систем ашиглагдана.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
