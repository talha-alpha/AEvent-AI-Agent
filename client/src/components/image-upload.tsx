import { useCallback } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onImageUpload(file);
        e.target.value = "";
      }
    },
    [onImageUpload]
  );

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
        data-testid="input-image-upload"
      />
      <label htmlFor="image-upload">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          asChild
          data-testid="button-upload-image"
        >
          <div className="cursor-pointer">
            <ImageIcon className="h-5 w-5" />
          </div>
        </Button>
      </label>
    </div>
  );
}
