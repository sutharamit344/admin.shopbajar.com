// src/components/common/ImageUpload.tsx
import React, { useState, useRef } from "react";
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { storage } from "../../app/config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

const isVideoUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  if (url.startsWith("data:")) {
    return url.startsWith("data:video/");
  }
  const pathPart = url.split("?")[0].toLowerCase();
  return (
    pathPart.endsWith(".mp4") ||
    pathPart.endsWith(".webm") ||
    pathPart.endsWith(".ogg") ||
    pathPart.endsWith(".mov") ||
    pathPart.endsWith(".m4v") ||
    pathPart.endsWith(".quicktime")
  );
};

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  folder = "shops",
  className = "",
  beforeUpload,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (beforeUpload) {
      const allowed = await beforeUpload(file);
      if (!allowed) {
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${isVideo ? "10MB" : "2MB"}`);
      return;
    }

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/\s+/g, "_")}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      onChange(url);
      toast.success("Media uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload media");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      <div className="relative">
        {value ? (
          <div className="relative w-full aspect-video rounded-md overflow-hidden border border-gray-200 group">
            {isVideoUrl(value) ? (
              <video
                src={value}
                className="w-full h-full object-cover"
                controls={false}
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full text-gray-700 hover:text-primary-600 shadow-lg cursor-pointer"
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-white rounded-full text-red-600 hover:text-red-700 shadow-lg cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`
              w-full aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md
              hover:border-primary-500 hover:bg-primary-50 transition-all group
              ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs font-medium text-gray-500">Uploading...</span>
              </div>
            ) : (
              <>
                <PhotoIcon className="w-10 h-10 text-gray-400 group-hover:text-primary-500 transition-colors" />
                <span className="mt-2 text-sm font-medium text-gray-600">Click to upload media</span>
                <span className="text-xs text-gray-400">Max size: 2MB (10MB for video)</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
