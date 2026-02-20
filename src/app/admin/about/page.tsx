"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/upload-client";

export default function AdminAboutPage() {
  const [quote, setQuote] = useState("");
  const [bio, setBio] = useState("");
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [aboutEnabled, setAboutEnabled] = useState(true);
  const [togglingEnabled, setTogglingEnabled] = useState(false);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    if (data.aboutQuote) setQuote(data.aboutQuote);
    if (data.aboutBio) setBio(data.aboutBio);
    if (data.aboutImageUrl) setPortraitUrl(data.aboutImageUrl);
    setAboutEnabled(data.aboutEnabled !== "false");
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  async function handleSaveText() {
    setSaving(true);
    setMessage(null);

    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "aboutQuote", value: quote }),
        }),
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "aboutBio", value: bio }),
        }),
      ]);
      setMessage("About page content saved successfully");
    } catch {
      setMessage("Failed to save content");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadPortrait(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 20;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage(`File is too large. Please use an image under ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const uploaded = await uploadToCloudinary(file);

      await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "aboutImageUrl", value: uploaded.url }),
        }),
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "aboutImagePublicId",
            value: uploaded.publicId,
          }),
        }),
      ]);

      setPortraitUrl(uploaded.url);
      setMessage("Portrait image updated successfully");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to upload image"
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePortrait() {
    setSaving(true);
    setMessage(null);

    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "aboutImageUrl", value: "" }),
        }),
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "aboutImagePublicId", value: "" }),
        }),
      ]);

      setPortraitUrl(null);
      setMessage("Portrait image removed");
    } catch {
      setMessage("Failed to remove image");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleEnabled() {
    setTogglingEnabled(true);
    setMessage(null);
    const newValue = !aboutEnabled;
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "aboutEnabled", value: String(newValue) }),
      });
      setAboutEnabled(newValue);
      setMessage(newValue ? "About page is now visible" : "About page is now hidden");
    } catch {
      setMessage("Failed to update visibility");
    } finally {
      setTogglingEnabled(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading">About Page</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {aboutEnabled ? "Visible on site" : "Hidden from site"}
          </span>
          <button
            onClick={handleToggleEnabled}
            disabled={togglingEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              aboutEnabled ? "bg-black" : "bg-gray-300"
            } ${togglingEnabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            role="switch"
            aria-checked={aboutEnabled}
            aria-label="Toggle About page visibility"
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                aboutEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className={`space-y-8 ${!aboutEnabled ? "opacity-50 pointer-events-none" : ""}`}>
        {/* Portrait Image */}
        <div className="bg-white p-6 rounded border border-gray-200">
          <h2 className="text-lg font-medium mb-1">Portrait Image</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your self portrait displayed on the About page.
          </p>

          {portraitUrl ? (
            <div className="relative aspect-[3/4] max-w-xs mb-4 bg-gray-100 rounded overflow-hidden">
              <Image
                src={portraitUrl}
                alt="Portrait preview"
                fill
                className="object-cover"
                sizes="320px"
              />
            </div>
          ) : (
            <div className="aspect-[3/4] max-w-xs mb-4 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-400 text-sm">No portrait set</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label
              className={`px-4 py-2 text-sm rounded cursor-pointer transition-colors ${
                uploading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Portrait"}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadPortrait}
                disabled={uploading || saving}
                className="hidden"
              />
            </label>

            {portraitUrl && (
              <button
                onClick={handleRemovePortrait}
                disabled={saving}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded hover:border-red-300 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Quote */}
        <div className="bg-white p-6 rounded border border-gray-200">
          <h2 className="text-lg font-medium mb-1">Quote</h2>
          <p className="text-sm text-gray-500 mb-4">
            A featured quote displayed prominently on the About page.
          </p>
          <input
            type="text"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="I get close because that's the only way to get to the truth of a face."
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Bio */}
        <div className="bg-white p-6 rounded border border-gray-200">
          <h2 className="text-lg font-medium mb-1">Bio</h2>
          <p className="text-sm text-gray-500 mb-4">
            Your biography text. Use blank lines to separate paragraphs.
          </p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={10}
            placeholder={`The streets are my studio. The flash is my paintbrush.\n\nMy work is raw, direct, and unapologetic.`}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveText}
            disabled={saving}
            className={`px-6 py-2 text-sm rounded transition-colors ${
              saving
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {saving ? "Saving..." : "Save Content"}
          </button>
        </div>
      </div>

      {message && (
        <p className="text-sm text-gray-600 mt-4">{message}</p>
      )}
    </div>
  );
}
