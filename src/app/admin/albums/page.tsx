"use client";

import { useState, useEffect } from "react";

interface Album {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count: { photos: number };
}

export default function AlbumsManagementPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    sortOrder: 0,
  });
  const [error, setError] = useState("");

  async function loadAlbums() {
    const res = await fetch("/api/albums");
    setAlbums(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadAlbums();
  }, []);

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newName.trim()) return;

    const res = await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDescription || null }),
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

  function startEditing(album: Album) {
    setEditingId(album.id);
    setEditForm({
      name: album.name,
      description: album.description || "",
      sortOrder: album.sortOrder,
    });
  }

  async function saveEdit() {
    if (!editingId) return;

    await fetch(`/api/albums/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description || null,
        sortOrder: editForm.sortOrder,
      }),
    });

    setEditingId(null);
    loadAlbums();
  }

  async function deleteAlbum(id: string, name: string) {
    if (!confirm(`Delete album "${name}"? Photos will not be deleted.`)) return;

    await fetch(`/api/albums/${id}`, { method: "DELETE" });
    loadAlbums();
  }

  if (loading) {
    return <div className="text-muted">Loading albums...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-heading mb-8">Manage Albums</h1>

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

      {/* Album list */}
      {albums.length === 0 ? (
        <p className="text-muted">No albums yet. Create your first one above.</p>
      ) : (
        <div className="space-y-3">
          {albums.map((album) => (
            <div
              key={album.id}
              className="bg-white rounded border border-gray-200 p-4"
            >
              {editingId === album.id ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Album name"
                      className="flex-1 text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-foreground"
                    />
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description"
                      className="flex-1 text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-foreground"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-muted whitespace-nowrap">
                      Sort:
                      <input
                        type="number"
                        value={editForm.sortOrder}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            sortOrder: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-16 text-sm border border-gray-200 px-2 py-1.5 rounded focus:outline-none focus:border-foreground"
                      />
                    </label>
                  </div>
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
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{album.name}</p>
                    {album.description && (
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {album.description}
                      </p>
                    )}
                    <p className="text-xs text-muted mt-0.5">
                      {album._count.photos}{" "}
                      {album._count.photos === 1 ? "photo" : "photos"}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEditing(album)}
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
                      onClick={() => deleteAlbum(album.id, album.name)}
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
