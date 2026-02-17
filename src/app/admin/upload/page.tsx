"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Album {
  id: string;
  name: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  result?: {
    publicId: string;
    url: string;
    width: number;
    height: number;
  };
  title: string;
  albumIds: string[];
  isFeatured: boolean;
}

export default function UploadPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/albums")
      .then((r) => r.json())
      .then(setAlbums);
  }, []);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );

    setFiles((prev) => [
      ...prev,
      ...fileArray.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        uploaded: false,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        albumIds: [],
        isFeatured: false,
      })),
    ]);
  }, []);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function updateFile(index: number, updates: Partial<UploadedFile>) {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  }

  async function uploadAndSave() {
    setSaving(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.uploaded) continue;

      updateFile(i, { uploading: true });

      try {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("files", file.file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");

        const [result] = await uploadRes.json();

        // Save to database
        const saveRes = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: file.title || null,
            cloudinaryPublicId: result.publicId,
            cloudinaryUrl: result.url,
            width: result.width,
            height: result.height,
            albumIds: file.albumIds,
            isFeatured: file.isFeatured,
          }),
        });

        if (!saveRes.ok) throw new Error("Save failed");

        updateFile(i, { uploading: false, uploaded: true, result });
      } catch (err) {
        updateFile(i, {
          uploading: false,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    setSaving(false);
  }

  const pendingCount = files.filter((f) => !f.uploaded && !f.error).length;

  return (
    <div>
      <h1 className="text-2xl font-heading mb-8">Upload Photos</h1>

      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive
            ? "border-foreground bg-gray-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 mx-auto mb-4 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-muted mb-2">
          Drag and drop your images here, or
        </p>
        <label className="inline-block px-4 py-2 border border-foreground text-sm tracking-widest uppercase cursor-pointer hover:bg-foreground hover:text-white transition-colors">
          Browse Files
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </label>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading">
              {files.length} {files.length === 1 ? "file" : "files"} selected
            </h2>
            {pendingCount > 0 && (
              <button
                onClick={uploadAndSave}
                disabled={saving}
                className="px-6 py-2 bg-foreground text-white text-sm tracking-widest uppercase hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Uploading..." : `Upload ${pendingCount} ${pendingCount === 1 ? "Photo" : "Photos"}`}
              </button>
            )}
          </div>

          {files.map((file, index) => (
            <div
              key={index}
              className={`bg-white rounded border p-4 flex gap-4 items-start ${
                file.uploaded
                  ? "border-green-200 bg-green-50/50"
                  : file.error
                  ? "border-red-200 bg-red-50/50"
                  : "border-gray-200"
              }`}
            >
              {/* Preview */}
              <div className="w-20 h-20 flex-shrink-0 relative overflow-hidden rounded bg-gray-100">
                <Image
                  src={file.preview}
                  alt={file.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-2">
                <input
                  type="text"
                  value={file.title}
                  onChange={(e) => updateFile(index, { title: e.target.value })}
                  placeholder="Photo title"
                  disabled={file.uploaded}
                  className="w-full text-sm border border-gray-200 px-3 py-1.5 rounded focus:outline-none focus:border-foreground disabled:bg-gray-50"
                />

                <div className="flex flex-wrap gap-2 items-center">
                  {/* Album selection */}
                  {albums.length > 0 && (
                    <select
                      multiple
                      value={file.albumIds}
                      onChange={(e) =>
                        updateFile(index, {
                          albumIds: Array.from(
                            e.target.selectedOptions,
                            (o) => o.value
                          ),
                        })
                      }
                      disabled={file.uploaded}
                      className="text-xs border border-gray-200 px-2 py-1 rounded focus:outline-none focus:border-foreground disabled:bg-gray-50"
                    >
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <label className="flex items-center gap-1.5 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={file.isFeatured}
                      onChange={(e) =>
                        updateFile(index, { isFeatured: e.target.checked })
                      }
                      disabled={file.uploaded}
                      className="rounded"
                    />
                    Featured
                  </label>
                </div>

                {file.uploading && (
                  <p className="text-xs text-muted">Uploading...</p>
                )}
                {file.uploaded && (
                  <p className="text-xs text-green-600">Uploaded successfully</p>
                )}
                {file.error && (
                  <p className="text-xs text-red-600">{file.error}</p>
                )}
              </div>

              {/* Remove */}
              {!file.uploaded && (
                <button
                  onClick={() => removeFile(index)}
                  className="text-muted hover:text-foreground p-1"
                  aria-label="Remove file"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
