
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image, X } from 'lucide-react';

interface MediaUploadProps {
  onMediaSelect: (file: File, preview: string) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

export const MediaUpload = ({ onMediaSelect, onCancel, isUploading = false }: MediaUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Basic compression by resizing canvas
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Compress image if larger than 800px
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              const previewUrl = canvas.toDataURL('image/jpeg', 0.8);
              setPreview(previewUrl);
              setSelectedFile(compressedFile);
            }
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (selectedFile && preview) {
      onMediaSelect(selectedFile, preview);
      setPreview(null);
      setSelectedFile(null);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    onCancel();
  };

  return (
    <div className="p-4 bg-white/5 backdrop-blur-sm border-t border-white/20">
      {!preview ? (
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Image className="w-4 h-4 mr-2" />
            Select Image
          </Button>
          <Button
            onClick={handleCancel}
            size="sm"
            variant="outline"
            className="text-white border-white/20"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-w-xs max-h-48 rounded-lg border border-white/20"
            />
            <Button
              onClick={handleCancel}
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 w-6 h-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleSend}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              disabled={isUploading}
            >
              {isUploading ? 'Sending...' : 'Send Image'}
            </Button>
            <Button
              onClick={handleCancel}
              size="sm"
              variant="outline"
              className="text-white border-white/20"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
