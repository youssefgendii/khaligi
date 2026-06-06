"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface UploadedFile {
  id: string;
  name: string;
  preview: string;
  url: string | null;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function BulkUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingAll, setUploadingAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList) {
    const newFiles: UploadedFile[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      const reader = new FileReader();
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      reader.onload = (e) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, preview: e.target?.result as string } : f
          )
        );
      };
      reader.readAsDataURL(file);
      newFiles.push({ id, name: file.name, preview: "", url: null, status: "pending" });
      // store file reference for upload
      (newFiles[newFiles.length - 1] as UploadedFile & { _file?: File })._file = file;
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }

  async function uploadFile(item: UploadedFile & { _file?: File }) {
    if (!item._file) return;
    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: "uploading" } : f))
    );
    try {
      const fd = new FormData();
      fd.append("file", item._file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: "done", url: data.url } : f
        )
      );
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "error", error: err instanceof Error ? err.message : "Failed" }
            : f
        )
      );
    }
  }

  async function uploadAll() {
    const pending = files.filter((f) => f.status === "pending" || f.status === "error");
    if (pending.length === 0) {
      toast.error("No pending images to upload.");
      return;
    }
    setUploadingAll(true);
    await Promise.all(pending.map((f) => uploadFile(f as UploadedFile & { _file?: File })));
    setUploadingAll(false);
    toast.success("All images uploaded!");
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("URL copied!");
  }

  const doneCount = files.filter((f) => f.status === "done").length;
  const pendingCount = files.filter((f) => f.status === "pending").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <a href="/admin/products" className="text-sm text-gray-400 hover:text-[#A9822B] mb-2 inline-block">
            ← Back to Products
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Upload Product Images</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Drag all your photos here — they upload to Supabase Storage automatically.
          </p>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={uploadAll}
            disabled={uploadingAll}
            className="bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold px-5 py-2.5 text-sm rounded transition-colors disabled:opacity-50"
          >
            {uploadingAll ? "Uploading..." : `Upload All (${pendingCount})`}
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all mb-6 ${
          dragOver
            ? "border-[#D6B25E] bg-[#D6B25E08]"
            : "border-gray-300 hover:border-[#D6B25E] hover:bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p className="text-base font-semibold text-gray-600">
          {dragOver ? "Drop photos here" : "Click or drag photos here"}
        </p>
        <p className="text-sm text-gray-400 mt-1">Select multiple images at once · Max 8MB each</p>
      </div>

      {/* Stats bar */}
      {files.length > 0 && (
        <div className="flex items-center gap-6 text-sm mb-4 px-1">
          <span className="text-gray-500">{files.length} total</span>
          {doneCount > 0 && <span className="text-green-600 font-medium">{doneCount} uploaded</span>}
          {pendingCount > 0 && <span className="text-[#A9822B] font-medium">{pendingCount} pending</span>}
          {files.some((f) => f.status === "error") && (
            <span className="text-red-500 font-medium">
              {files.filter((f) => f.status === "error").length} failed
            </span>
          )}
          <button
            onClick={() => setFiles([])}
            className="ml-auto text-gray-400 hover:text-red-500 transition-colors text-xs"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Image grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {files.map((file) => (
            <div key={file.id} className="relative group">
              {/* Image preview */}
              <div className="aspect-[3/4] bg-gray-100 rounded overflow-hidden relative">
                {file.preview ? (
                  <Image src={file.preview} alt={file.name} fill className="object-cover" sizes="160px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Status overlay */}
                {file.status === "uploading" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#D6B25E] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {file.status === "done" && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
                {file.status === "error" && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    !
                  </div>
                )}
                {file.status === "pending" && (
                  <div className="absolute top-2 left-2 bg-[#D6B25E] text-[#050505] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                    ↑
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>

              {/* File name */}
              <p className="text-xs text-gray-500 mt-1.5 truncate px-0.5">{file.name}</p>

              {/* URL copy button */}
              {file.status === "done" && file.url && (
                <button
                  onClick={() => copyUrl(file.url!)}
                  className="mt-1 w-full text-xs bg-[#050505] hover:bg-[#1a1a1a] text-[#D6B25E] py-1.5 rounded transition-colors"
                >
                  Copy URL
                </button>
              )}

              {/* Upload single button */}
              {(file.status === "pending" || file.status === "error") && (
                <button
                  onClick={() => uploadFile(file as UploadedFile & { _file?: File })}
                  className="mt-1 w-full text-xs bg-gray-100 hover:bg-[#D6B25E] text-gray-600 hover:text-[#050505] py-1.5 rounded transition-colors"
                >
                  {file.status === "error" ? "Retry" : "Upload"}
                </button>
              )}

              {file.status === "error" && (
                <p className="text-xs text-red-500 mt-1 truncate">{file.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {files.length === 0 && (
        <div className="bg-white rounded border border-gray-200 p-6 mt-2">
          <h3 className="font-semibold text-gray-800 mb-3">How it works</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li><span className="font-semibold text-[#A9822B]">1.</span> Drag all your product photos into the box above (select multiple at once)</li>
            <li><span className="font-semibold text-[#A9822B]">2.</span> Click <strong>Upload All</strong> — photos go to Supabase Storage</li>
            <li><span className="font-semibold text-[#A9822B]">3.</span> Go to <a href="/admin/products/new" className="text-[#A9822B] underline">Add Product</a> and click the image area to upload directly while creating a product</li>
          </ol>
        </div>
      )}
    </div>
  );
}
