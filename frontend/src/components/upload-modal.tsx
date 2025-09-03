"use client";
import { useState, useRef } from "react";
import { X, Upload, User, MapPin, Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface PersonInfo {
  name: string;
  age: string;
  last_seen_data: string;
  last_seen_location: string;
  phone_number: string;
  add_info: string;
  img: File | null;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [personInfo, setPersonInfo] = useState<PersonInfo>({
    name: "",
    age: "",
    last_seen_data: "",
    last_seen_location: "",
    add_info: "",
    phone_number: "",
    img: null,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!personInfo.name || !personInfo.age || !personInfo.img) {
        toast("Нэр, нас, зураг заавал оруулна уу");
        return;
      }

      const fileToBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });

      const base64Image = await fileToBase64(personInfo.img);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

      const payload = {
        name: personInfo.name,
        age: personInfo.age,
        last_seen_data: personInfo.last_seen_data,
        last_seen_location: personInfo.last_seen_location,
        phone_number: personInfo.phone_number,
        add_info: personInfo.add_info,
        img: base64Image,
      };

      const { status, data } = await axios.post(`${API_URL}/person`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (status === 200) {
        toast("Амжилттай нэмлээ!");
        router.push(`/search/${data.person._id}`);
      }
    } catch (error) {
      console.error(error);
      toast("Алдаа гарлаа, дахин оролдоно уу");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-10 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Алга болсон хүн нэмэх
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <Label htmlFor="img" className="text-base font-medium">
              Хүний зураг
            </Label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setImagePreview("");
                          setPersonInfo((prev) => ({ ...prev, img: null }));
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Зураг устгах
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Зураг оруулах эсвэл камераар зурах
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, JPEG файлууд дэмжигдэнэ
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Файл сонгох</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  id="img"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Image upload input"
                  title="Image upload input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPersonInfo((prev) => ({ ...prev, img: file }));
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setImagePreview(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Нэр *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  value={personInfo.name}
                  onChange={(e) =>
                    setPersonInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Бүтэн нэр"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Нас *</Label>
              <Input
                id="age"
                type="number"
                value={personInfo.age}
                onChange={(e) =>
                  setPersonInfo((prev) => ({ ...prev, age: e.target.value }))
                }
                placeholder="Нас"
                min="1"
                max="120"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_seen_data">Сүүлд харагдсан огноо</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="last_seen_data"
                  type="date"
                  value={personInfo.last_seen_data}
                  onChange={(e) =>
                    setPersonInfo((prev) => ({
                      ...prev,
                      last_seen_data: e.target.value,
                    }))
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Утасны дугаар</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phone_number"
                  value={personInfo.phone_number}
                  onChange={(e) =>
                    setPersonInfo((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                  placeholder="Утасны дугаар"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_seen_location">Сүүлд харагдсан газар</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="last_seen_location"
                value={personInfo.last_seen_location}
                onChange={(e) =>
                  setPersonInfo((prev) => ({
                    ...prev,
                    last_seen_location: e.target.value,
                  }))
                }
                placeholder="Газрын нэр"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add_info">Нэмэлт мэдээлэл</Label>
            <textarea
              id="add_info"
              value={personInfo.add_info}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setPersonInfo((prev) => ({
                  ...prev,
                  add_info: e.target.value,
                }))
              }
              placeholder="Хүний талаарх нэмэлт мэдээлэл, хувцас, онцлог шинж чанар..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Цуцлах
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Илгээж байна...</span>
                </div>
              ) : (
                "Хайлт эхлүүлэх"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
