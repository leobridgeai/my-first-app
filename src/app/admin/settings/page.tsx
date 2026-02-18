"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

export default function AdminSettingsPage() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    if (data.heroImageUrl) setHeroImageUrl(data.heroImageUrl);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const uploadData = await uploadRes.json();
      const uploaded = uploadData[0];

      // Save both the URL and publicId
      setSaving(true);
      await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "heroImageUrl",
            value: uploaded.url,
          }),
        }),
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "heroImagePublicId",
            value: uploaded.publicId,
          }),
        }),
      ]);

      setHeroImageUrl(uploaded.url);
      setMessage("Hero image updated successfully");
    } catch {
      setMessage("Failed to upload image");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    setMessage(null);

    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "heroImageUrl", value: "" }),
        }),
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "heroImagePublicId", value: "" }),
        }),
      ]);

      setHeroImageUrl(null);
      setMessage("Hero image removed");
    } catch {
      setMessage("Failed to remove image");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-heading mb-8">Site Settings</h1>

      {/* Hero Image Section */}
      <div className="bg-white p-6 rounded border border-gray-200">
        <h2 className="text-lg font-medium mb-1">Landing Page Hero Image</h2>
        <p className="text-sm text-gray-500 mb-6">
          This image will be displayed as the full-screen background on the
          homepage.
        </p>

        {/* Preview */}
        {heroImageUrl ? (
          <div className="relative aspect-video max-w-xl mb-4 bg-gray-100 rounded overflow-hidden">
            <Image
              src={heroImageUrl}
              alt="Hero image preview"
              fill
              className="object-cover"
              sizes="600px"
            />
          </div>
        ) : (
          <div className="aspect-video max-w-xl mb-4 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-400 text-sm">No hero image set</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <label
            className={`px-4 py-2 text-sm rounded cursor-pointer transition-colors ${
              uploading || saving
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {uploading ? "Uploading..." : saving ? "Saving..." : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading || saving}
              className="hidden"
            />
          </label>

          {heroImageUrl && (
            <button
              onClick={handleRemove}
              disabled={saving}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded hover:border-red-300 transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <p className="mt-3 text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}
