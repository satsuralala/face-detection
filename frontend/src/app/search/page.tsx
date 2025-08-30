import { Button } from "@/components/ui/button";
import Header from "@/src/components/header";
import { Video } from "lucide-react";

const Search = () => {
  return (
    <div>
      <Header />
      <div className="flex flex-row">
        <div className="flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
        <div className="flex-1"></div>
      </div>
    </div>
  );
};
export default Search;
