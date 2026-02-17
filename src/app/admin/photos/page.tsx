"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Album {
  id: string;
  name: string;
  slug: string;
}

interface Photo {
  id: string;
  title: string | null;
  description: string | null;
  cloudinaryUrl: string;
  width: number;
  height: number;
  isFeatured: boolean;
  sortOrder: number;
  albums: { album: Album }[];
}

export default function PhotosManagementPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    sortOrder: 0,
    isFeatured: false,
    albumIds: [] as string[],
  });

  async function loadData() {
    const [photosRes, albumsRes] = await Promise.all([
      fetch("/api/photos"),
      fetch("/api/albums"),
    ]);
    setPhotos(await photosRes.json());
    setAlbums(await albumsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function startEditing(photo: Photo) {
    setEditingId(photo.id);
    setEditForm({
      title: photo.title || "",
      description: photo.description || "",
      sortOrder: photo.sortOrder,
      isFeatured: photo.isFeatured,
      albumIds: photo.albums.map((pa) => pa.album.id),
    });
  }

  async function saveEdit() {
    if (!editingId) return;

    await fetch(`/api/photos/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    setEditingId(null);
    loadData();
  }

  async function deletePhoto(id: string) {
    if (!confirm("Delete this photo permanently?")) return;

    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    loadData();
  }

  async function toggleFeatured(photo: Photo) {
    await fetch(`/api/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !photo.isFeatured }),
    });
    loadData();
  }

  if (loading) {
    return <div className="text-muted">Loading photos...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-heading mb-8">Manage Photos</h1>

      {photos.length === 0 ? (
        <p className="text-muted">
          No photos yet. Go to Upload to add some.
        </p>
      ) : (
        <div className="space-y-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded border border-gray-200 p-4"
            >
              {editingId === photo.id ? (
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
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      placeholder="Title"
                      className="w-full text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-foreground"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description"
                      rows={2}
                      className="w-full text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-foreground resize-none"
                    />
                    <div className="flex flex-wrap gap-3 items-center">
                      <label className="text-xs text-muted">
                        Sort Order:
                        <input
                          type="number"
                          value={editForm.sortOrder}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              sortOrder: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-16 ml-2 text-sm border border-gray-200 px-2 py-1 rounded focus:outline-none focus:border-foreground"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-muted">
                        <input
                          type="checkbox"
                          checked={editForm.isFeatured}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isFeatured: e.target.checked,
                            })
                          }
                        />
                        Featured
                      </label>
                    </div>
                    {albums.length > 0 && (
                      <div>
                        <p className="text-xs text-muted mb-1">Albums:</p>
                        <div className="flex flex-wrap gap-2">
                          {albums.map((album) => (
                            <label
                              key={album.id}
                              className="flex items-center gap-1.5 text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={editForm.albumIds.includes(album.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditForm({
                                      ...editForm,
                                      albumIds: [
                                        ...editForm.albumIds,
                                        album.id,
                                      ],
                                    });
                                  } else {
                                    setEditForm({
                                      ...editForm,
                                      albumIds: editForm.albumIds.filter(
                                        (id) => id !== album.id
                                      ),
                                    });
                                  }
                                }}
                              />
                              {album.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-4 py-1.5 bg-foreground text-white text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 border border-gray-200 text-xs tracking-widest uppercase hover:border-foreground transition-colors"
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
                      {photo.albums.map((pa) => (
                        <span
                          key={pa.album.id}
                          className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-muted rounded"
                        >
                          {pa.album.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
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
                    <button
                      onClick={() => startEditing(photo)}
                      className="p-1.5 text-muted hover:text-foreground transition-colors"
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
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="p-1.5 text-muted hover:text-red-500 transition-colors"
                      title="Delete"
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
