"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Photo {
  id: string;
  cloudinaryUrl: string;
}

interface Album {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverPhotoId: string | null;
  coverPhoto: Photo | null;
  sortOrder: number;
  _count: { photos: number };
  photos: { photo: Photo }[];
}

export default function AlbumsManagementPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/albums")
      .then((res) => res.json())
      .then((data) => {
        setAlbums(data);
        setLoading(false);
      });
  }, []);

  async function loadAlbums() {
    const res = await fetch("/api/albums");
    setAlbums(await res.json());
  }

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newName.trim()) return;

    const res = await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        description: newDescription || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create album");
      return;
    }

    setNewName("");
    setNewDescription("");
    loadAlbums();
  }

  async function deleteAlbum(
    e: React.MouseEvent,
    id: string,
    name: string
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete album "${name}"? Photos will not be deleted.`))
      return;

    await fetch(`/api/albums/${id}`, { method: "DELETE" });
    loadAlbums();
  }

  if (loading) {
    return <div className="text-muted">Loading albums...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-heading mb-8">Albums</h1>

      {/* Create new album */}
      <form
        onSubmit={createAlbum}
        className="bg-white rounded border border-gray-200 p-4 mb-8"
      >
        <h2 className="text-sm tracking-widest uppercase text-muted mb-3">
          Create New Album
        </h2>
        {error && (
          <div className="p-2 text-sm text-red-600 bg-red-50 rounded mb-3">
            {error}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Album name"
            className="flex-1 text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-foreground"
            required
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1 text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-foreground"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-foreground text-white text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors whitespace-nowrap"
          >
            Create
          </button>
        </div>
      </form>

      {/* Album grid */}
      {albums.length === 0 ? (
        <p className="text-muted">
          No albums yet. Create your first one above.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => {
            const coverUrl =
              album.coverPhoto?.cloudinaryUrl ||
              album.photos[0]?.photo.cloudinaryUrl;
            return (
              <Link
                key={album.id}
                href={`/admin/albums/${album.id}`}
                className="bg-white rounded border border-gray-200 overflow-hidden hover:border-foreground transition-colors group"
              >
                {/* Cover image */}
                <div className="relative aspect-[3/2] bg-gray-100">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={album.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Album info */}
                <div className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm group-hover:text-foreground truncate">
                      {album.name}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {album._count.photos}{" "}
                      {album._count.photos === 1 ? "photo" : "photos"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteAlbum(e, album.id, album.name)}
                    className="p-1.5 text-muted hover:text-red-500 transition-colors flex-shrink-0"
                    title="Delete album"
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
