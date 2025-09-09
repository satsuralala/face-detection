"use client";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Phone,
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

interface PersonInfoProps {
  person: PersonPayload | null;
  founded: FoundedPayload | null;
}

export function PersonInfo({ person, founded }: PersonInfoProps) {
  if (!person) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="text-muted-foreground">Хүний мэдээлэл олдсонгүй.</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          {person.img && (
            <img
              src={person.img || "/placeholder.svg"}
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
              <div className="text-muted-foreground">Сүүлд харагдсан огноо</div>
              <div className="font-medium">{person.last_seen_data || "-"}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-muted-foreground">Сүүлд харагдсан газар</div>
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
                <div className="font-medium">{person.phone_number}</div>
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
                      {founded?.name || person.name}
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
                    <div className="text-sm font-semibold">
                      Хайж буй хүн одоогоор олдоогүй байна
                    </div>
                    <div className="text-xs mt-0.5 truncate">
                      {founded?.name || person.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
