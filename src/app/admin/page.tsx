"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalPhotos: number;
  totalAlbums: number;
  featuredPhotos: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const [photosRes, albumsRes] = await Promise.all([
        fetch("/api/photos"),
        fetch("/api/albums"),
      ]);
      const photos = await photosRes.json();
      const albums = await albumsRes.json();

      setStats({
        totalPhotos: photos.length,
        totalAlbums: albums.length,
        featuredPhotos: photos.filter(
          (p: { isFeatured: boolean }) => p.isFeatured
        ).length,
      });
    }
    loadStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-heading mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Photos", value: stats?.totalPhotos ?? "..." },
          { label: "Albums", value: stats?.totalAlbums ?? "..." },
          { label: "Featured", value: stats?.featuredPhotos ?? "..." },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded border border-gray-200"
          >
            <p className="text-xs tracking-widest uppercase text-muted">
              {stat.label}
            </p>
            <p className="text-3xl font-heading mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-heading mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/albums"
          className="bg-white p-6 rounded border border-gray-200 hover:border-foreground transition-colors group"
        >
          <p className="font-medium group-hover:text-foreground">
            Manage Albums
          </p>
          <p className="text-sm text-muted mt-1">
            Create albums and manage photos
          </p>
        </Link>
      </div>
    </div>
  );
}
