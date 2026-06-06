"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB.");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setLocalPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      setLocalPreview(null);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  }

  const displayed = localPreview || value;

  if (displayed) {
    return (
      <div className="relative aspect-[3/4] bg-gray-50 rounded overflow-hidden group cursor-pointer"
        onClick={() => !uploading && inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        <Image src={displayed} alt="Product" fill className="object-cover" sizes="220px" />

        {/* Hover overlay */}
        {!uploading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-white text-xs font-semibold">Click to replace</span>
          </div>
        )}

        {/* Uploading spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#D6B25E] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Remove button */}
        {value && !uploading && (
          <button type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors z-10">
            ✕
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`aspect-[3/4] border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer transition-all ${
        dragOver
          ? "border-[#D6B25E] bg-[#D6B25E08] scale-[1.01]"
          : "border-gray-300 hover:border-[#D6B25E] hover:bg-gray-50"
      }`}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {uploading ? (
        <div className="w-10 h-10 border-2 border-[#D6B25E] border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <p className="text-sm font-medium text-gray-500">
            {dragOver ? "Drop image here" : "Click or drag to upload"}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 8MB</p>
        </>
      )}
    </div>
  );
}
