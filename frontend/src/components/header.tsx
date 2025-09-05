"use client";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.push("/auth/signin");
  };
  return (
    <header className="bg-card border-b  shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md"
              onClick={() => router.push("/")}
            >
              <Shield color="white" className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Hope</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground flex items-center">
              <User className="h-4 w-4 mr-1" />
              12345678
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Гарах
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
