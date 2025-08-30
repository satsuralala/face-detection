"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    badgeNumber: "",
    password: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation for demo purposes
      if (formData.badgeNumber && formData.password) {
        // Store auth state (in real app, use proper session management)
        localStorage.setItem("police_auth", "true");
        localStorage.setItem("officer_badge", formData.badgeNumber);
        router.push("/dashboard");
      } else {
        setError("Please enter both badge number and password.");
      }
    } catch (err) {
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="badgeNumber">Badge Number</Label>
        <Input
          id="badgeNumber"
          type="text"
          placeholder="Enter your badge number"
          value={formData.badgeNumber}
          onChange={(e) => handleInputChange("badgeNumber", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Authenticating...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
