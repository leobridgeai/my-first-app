import { createClient } from "@libsql/client";

const client = createClient({ url: "file:./prisma/dev.db" });

// Create tables first
await client.execute(`CREATE TABLE IF NOT EXISTS Album (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  coverPhotoId TEXT,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
  updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
)`);

await client.execute(`CREATE TABLE IF NOT EXISTS Photo (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  cloudinaryPublicId TEXT NOT NULL,
  cloudinaryUrl TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  isFeatured INTEGER NOT NULL DEFAULT 0,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
  updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
)`);

await client.execute(`CREATE TABLE IF NOT EXISTS PhotoAlbum (
  photoId TEXT NOT NULL,
  albumId TEXT NOT NULL,
  PRIMARY KEY (photoId, albumId),
  FOREIGN KEY (photoId) REFERENCES Photo(id) ON DELETE CASCADE,
  FOREIGN KEY (albumId) REFERENCES Album(id) ON DELETE CASCADE
)`);

await client.execute(`CREATE TABLE IF NOT EXISTS SiteSetting (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)`);

const albumId = crypto.randomUUID();
const photoId = crypto.randomUUID();

await client.execute({
  sql: "INSERT INTO Album (id, name, slug, description, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, datetime('now'), datetime('now'))",
  args: [albumId, "Street Portraits", "street-portraits", "Raw street portraits"],
});

await client.execute({
  sql: "INSERT INTO Photo (id, cloudinaryPublicId, cloudinaryUrl, width, height, isFeatured, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, 800, 1200, 0, 0, datetime('now'), datetime('now'))",
  args: [photoId, "test/photo1", "https://res.cloudinary.com/demo/image/upload/sample.jpg"],
});

await client.execute({
  sql: "INSERT INTO PhotoAlbum (photoId, albumId) VALUES (?, ?)",
  args: [photoId, albumId],
});

console.log("Seeded album: Street Portraits (slug: street-portraits)");
