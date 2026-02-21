"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

function SortableAlbumCard({
  album,
  onDelete,
}: {
  album: Album;
  onDelete: (e: React.MouseEvent, id: string, name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: album.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const coverUrl =
    album.coverPhoto?.cloudinaryUrl || album.photos[0]?.photo.cloudinaryUrl;

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Link
        href={`/admin/albums/${album.id}`}
        className="bg-white rounded border border-gray-200 overflow-hidden hover:border-gray-900 transition-colors group block"
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
          {/* Drag handle overlay */}
          <button
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-sm rounded shadow-sm text-gray-500 hover:text-gray-900 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
            onClick={(e) => e.preventDefault()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <circle cx="7" cy="4" r="1.5" />
              <circle cx="13" cy="4" r="1.5" />
              <circle cx="7" cy="10" r="1.5" />
              <circle cx="13" cy="10" r="1.5" />
              <circle cx="7" cy="16" r="1.5" />
              <circle cx="13" cy="16" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Album info */}
        <div className="p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm group-hover:text-gray-900 truncate">
              {album.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {album._count.photos}{" "}
              {album._count.photos === 1 ? "photo" : "photos"}
            </p>
          </div>
          <button
            onClick={(e) => onDelete(e, album.id, album.name)}
            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
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
    </div>
  );
}

export default function AlbumsManagementPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = albums.findIndex((a) => a.id === active.id);
    const newIndex = albums.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(albums, oldIndex, newIndex);

    setAlbums(reordered);
    setSaving(true);

    await fetch("/api/albums/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderedIds: reordered.map((a) => a.id),
      }),
    });

    setSaving(false);
  }

  if (loading) {
    return <div className="text-gray-500">Loading albums...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-heading">Albums</h1>
        {saving && (
          <span className="text-xs text-gray-400">Saving order...</span>
        )}
      </div>

      {/* Create new album */}
      <form
        onSubmit={createAlbum}
        className="bg-white rounded border border-gray-200 p-4 mb-8"
      >
        <h2 className="text-sm tracking-widest uppercase text-gray-500 mb-3">
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
            className="flex-1 text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-gray-900"
            required
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1 text-sm border border-gray-200 px-3 py-2 rounded focus:outline-none focus:border-gray-900"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gray-900 text-white text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Create
          </button>
        </div>
      </form>

      {/* Album grid */}
      {albums.length === 0 ? (
        <p className="text-gray-500">
          No albums yet. Create your first one above.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={albums.map((a) => a.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.map((album) => (
                <SortableAlbumCard
                  key={album.id}
                  album={album}
                  onDelete={deleteAlbum}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
