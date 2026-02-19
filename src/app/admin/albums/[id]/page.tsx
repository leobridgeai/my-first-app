"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { uploadToCloudinary } from "@/lib/upload-client";

interface Photo {
  id: string;
  title: string | null;
  description: string | null;
  cloudinaryUrl: string;
  width: number;
  height: number;
  isFeatured: boolean;
  sortOrder: number;
}

interface Album {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverPhotoId: string | null;
  coverPhoto: Photo | null;
  sortOrder: number;
  photos: { photo: Photo }[];
}

interface UploadingFile {
  file: File;
  preview: string;
  title: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  // Album editing
  const [editingAlbum, setEditingAlbum] = useState(false);
  const [albumForm, setAlbumForm] = useState({
    name: "",
    description: "",
    sortOrder: 0,
  });

  // Photo editing
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [photoForm, setPhotoForm] = useState({
    title: "",
    description: "",
    sortOrder: 0,
    isFeatured: false,
  });

  // Upload
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAlbum = useCallback(async () => {
    const res = await fetch(`/api/albums/${id}`);
    if (!res.ok) {
      router.push("/admin/albums");
      return;
    }
    const data = await res.json();
    setAlbum(data);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  // --- Album settings ---

  function startEditingAlbum() {
    if (!album) return;
    setAlbumForm({
      name: album.name,
      description: album.description || "",
      sortOrder: album.sortOrder,
    });
    setEditingAlbum(true);
  }

  async function saveAlbumEdit() {
    await fetch(`/api/albums/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: albumForm.name,
        description: albumForm.description || null,
        sortOrder: albumForm.sortOrder,
      }),
    });
    setEditingAlbum(false);
    loadAlbum();
  }

  // --- Cover photo ---

  async function setCoverPhoto(photoId: string | null) {
    await fetch(`/api/albums/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverPhotoId: photoId }),
    });
    loadAlbum();
  }

  // --- Photo editing ---

  function startEditingPhoto(photo: Photo) {
    setEditingPhotoId(photo.id);
    setPhotoForm({
      title: photo.title || "",
      description: photo.description || "",
      sortOrder: photo.sortOrder,
      isFeatured: photo.isFeatured,
    });
  }

  async function savePhotoEdit() {
    if (!editingPhotoId) return;
    await fetch(`/api/photos/${editingPhotoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(photoForm),
    });
    setEditingPhotoId(null);
    loadAlbum();
  }

  async function removePhotoFromAlbum(photoId: string) {
    if (!confirm("Remove this photo from the album?")) return;

    await fetch(`/api/albums/${id}/photos/${photoId}`, {
      method: "DELETE",
    });
    loadAlbum();
  }

  async function deletePhoto(photoId: string) {
    if (!confirm("Delete this photo permanently? This cannot be undone."))
      return;

    await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    loadAlbum();
  }

  async function toggleFeatured(photo: Photo) {
    await fetch(`/api/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !photo.isFeatured }),
    });
    loadAlbum();
  }

  // --- Upload ---

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [
      ...prev,
      ...fileArray.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        uploading: false,
        uploaded: false,
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

  function updateFile(index: number, updates: Partial<UploadingFile>) {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  }

  async function uploadAll() {
    setSaving(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.uploaded) continue;

      updateFile(i, { uploading: true, error: undefined });

      try {
        const result = await uploadToCloudinary(file.file);

        await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: file.title || null,
            cloudinaryPublicId: result.publicId,
            cloudinaryUrl: result.url,
            width: result.width,
            height: result.height,
            albumIds: [id],
          }),
        });

        updateFile(i, { uploading: false, uploaded: true });
      } catch (err) {
        updateFile(i, {
          uploading: false,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }

      if (i < files.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    setSaving(false);
    loadAlbum();
  }

  if (loading || !album) {
    return <div className="text-gray-500">Loading album...</div>;
  }

  const photos = album.photos.map((pa) => pa.photo);
  const pendingCount = files.filter((f) => !f.uploaded && !f.error).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/albums"
          className="text-xs text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1 mb-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          All Albums
        </Link>

        {editingAlbum ? (
          <div className="bg-white rounded border border-gray-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={albumForm.name}
                onChange={(e) =>
                  setAlbumForm({ ...albumForm, name: e.target.value })
                }
                placeholder="Album name"
                className="flex-1 text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-gray-900"
              />
              <input
                type="text"
                value={albumForm.description}
                onChange={(e) =>
                  setAlbumForm({ ...albumForm, description: e.target.value })
                }
                placeholder="Description"
                className="flex-1 text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-gray-900"
              />
              <label className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                Sort:
                <input
                  type="number"
                  value={albumForm.sortOrder}
                  onChange={(e) =>
                    setAlbumForm({
                      ...albumForm,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-16 text-sm border border-gray-200 px-2 py-1.5 rounded focus:outline-none focus:border-gray-900"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveAlbumEdit}
                className="px-4 py-1.5 bg-gray-900 text-white text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditingAlbum(false)}
                className="px-4 py-1.5 border border-gray-200 text-xs tracking-widest uppercase hover:border-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-heading">{album.name}</h1>
            <button
              onClick={startEditingAlbum}
              className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
              title="Edit album details"
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
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
          </div>
        )}
        {!editingAlbum && album.description && (
          <p className="text-sm text-gray-500 mt-1">{album.description}</p>
        )}
      </div>

      {/* Upload section */}
      <div className="mb-8">
        <h2 className="text-sm tracking-widest uppercase text-gray-500 mb-3">
          Add Photos
        </h2>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-gray-900 bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 mx-auto mb-3 text-gray-500"
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
          <p className="text-sm text-gray-500 mb-2">
            Drag and drop images here, or
          </p>
          <label className="inline-block px-4 py-1.5 border border-gray-900 text-xs tracking-widest uppercase cursor-pointer hover:bg-gray-900 hover:text-white transition-colors">
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

        {/* Pending uploads */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {files.length} {files.length === 1 ? "file" : "files"} selected
              </p>
              {pendingCount > 0 && (
                <button
                  onClick={uploadAll}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-900 text-white text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "Uploading..."
                    : `Upload ${pendingCount} ${pendingCount === 1 ? "Photo" : "Photos"}`}
                </button>
              )}
            </div>
            {files.map((file, index) => (
              <div
                key={index}
                className={`bg-white rounded border p-3 flex gap-3 items-center ${
                  file.uploaded
                    ? "border-green-200 bg-green-50/50"
                    : file.error
                      ? "border-red-200 bg-red-50/50"
                      : "border-gray-200"
                }`}
              >
                <div className="w-12 h-12 flex-shrink-0 relative overflow-hidden rounded bg-gray-100">
                  <Image
                    src={file.preview}
                    alt={file.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <input
                  type="text"
                  value={file.title}
                  onChange={(e) => updateFile(index, { title: e.target.value })}
                  disabled={file.uploaded}
                  placeholder="Title"
                  className="flex-1 text-sm border border-gray-200 px-2 py-1 rounded focus:outline-none focus:border-gray-900 disabled:bg-gray-50"
                />
                {file.uploading && (
                  <span className="text-xs text-gray-500">Uploading...</span>
                )}
                {file.uploaded && (
                  <span className="text-xs text-green-600">Done</span>
                )}
                {file.error && (
                  <span className="text-xs text-red-600">{file.error}</span>
                )}
                {!file.uploaded && (
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-gray-900 p-1"
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

      {/* Photos grid */}
      <h2 className="text-sm tracking-widest uppercase text-gray-500 mb-3">
        Photos ({photos.length})
      </h2>

      {photos.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No photos in this album yet. Upload some above.
        </p>
      ) : (
        <div className="space-y-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded border border-gray-200 p-4"
            >
              {editingPhotoId === photo.id ? (
                /* Edit mode */
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden rounded bg-gray-100">
                    <Image
                      src={photo.cloudinaryUrl}
                      alt={photo.title || "Photo"}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={photoForm.title}
                      onChange={(e) =>
                        setPhotoForm({ ...photoForm, title: e.target.value })
                      }
                      placeholder="Title"
                      className="w-full text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-gray-900"
                    />
                    <textarea
                      value={photoForm.description}
                      onChange={(e) =>
                        setPhotoForm({
                          ...photoForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description"
                      rows={2}
                      className="w-full text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-gray-900 resize-none"
                    />
                    <div className="flex flex-wrap gap-3 items-center">
                      <label className="text-xs text-gray-500">
                        Sort:
                        <input
                          type="number"
                          value={photoForm.sortOrder}
                          onChange={(e) =>
                            setPhotoForm({
                              ...photoForm,
                              sortOrder: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-16 ml-2 text-sm border border-gray-200 px-2 py-1 rounded focus:outline-none focus:border-gray-900"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          checked={photoForm.isFeatured}
                          onChange={(e) =>
                            setPhotoForm({
                              ...photoForm,
                              isFeatured: e.target.checked,
                            })
                          }
                        />
                        Featured
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={savePhotoEdit}
                        className="px-4 py-1.5 bg-gray-900 text-white text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPhotoId(null)}
                        className="px-4 py-1.5 border border-gray-200 text-xs tracking-widest uppercase hover:border-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded bg-gray-100">
                    <Image
                      src={photo.cloudinaryUrl}
                      alt={photo.title || "Photo"}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {photo.title || "Untitled"}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {photo.isFeatured && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                          Featured
                        </span>
                      )}
                      {album.coverPhotoId === photo.id && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {/* Set as cover */}
                    <button
                      onClick={() =>
                        setCoverPhoto(
                          album.coverPhotoId === photo.id ? null : photo.id
                        )
                      }
                      className={`p-1.5 rounded transition-colors ${
                        album.coverPhotoId === photo.id
                          ? "text-blue-500 hover:text-blue-600"
                          : "text-gray-300 hover:text-blue-500"
                      }`}
                      title={
                        album.coverPhotoId === photo.id
                          ? "Remove as cover"
                          : "Set as cover"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill={
                          album.coverPhotoId === photo.id
                            ? "currentColor"
                            : "none"
                        }
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                        />
                      </svg>
                    </button>
                    {/* Toggle featured */}
                    <button
                      onClick={() => toggleFeatured(photo)}
                      className={`p-1.5 rounded transition-colors ${
                        photo.isFeatured
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-300 hover:text-yellow-500"
                      }`}
                      title={
                        photo.isFeatured
                          ? "Remove from featured"
                          : "Set as featured"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill={photo.isFeatured ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => startEditingPhoto(photo)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
                      title="Edit"
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
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </button>
                    {/* Remove from album */}
                    <button
                      onClick={() => removePhotoFromAlbum(photo.id)}
                      className="p-1.5 text-gray-500 hover:text-orange-500 transition-colors"
                      title="Remove from album"
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
                          d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                    {/* Delete permanently */}
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete permanently"
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
