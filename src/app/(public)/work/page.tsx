import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Work | Raw Street Portraits",
};

// Scattered positioning for single-image rows
const singlePositions = [
  { left: "7%", width: 360 },
  { left: "4%", width: 320 },
  { left: "12%", width: 290 },
  { left: "3%", width: 340 },
];

// Scattered positioning for paired-image rows
const pairPositions = [
  { left: "13%", gap: 70, widths: [210, 270] },
  { left: "20%", gap: 50, widths: [250, 200] },
  { left: "8%", gap: 80, widths: [190, 250] },
];

export default async function WorkPage() {
  const albums = await prisma.album.findMany({
    include: {
      _count: { select: { photos: true } },
      coverPhoto: true,
      photos: {
        include: { photo: true },
        orderBy: { photo: { sortOrder: "asc" } },
        take: 1,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  if (albums.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/20 text-sm tracking-[0.2em] uppercase">
          No work yet.
        </p>
      </div>
    );
  }

  // Group albums into visual rows: single, pair, single, pair...
  const rows: (typeof albums[number])[][] = [];
  let i = 0;
  let wantPair = false;
  while (i < albums.length) {
    if (!wantPair || i + 1 >= albums.length) {
      rows.push([albums[i]]);
      i++;
    } else {
      rows.push([albums[i], albums[i + 1]]);
      i += 2;
    }
    wantPair = !wantPair;
  }

  let singleCount = 0;
  let pairCount = 0;

  return (
    <div className="min-h-screen pt-28 md:pt-36 pb-40 md:pb-56">
      {rows.map((row, rowIndex) => {
        if (row.length === 1) {
          const pos =
            singlePositions[singleCount % singlePositions.length];
          singleCount++;
          const album = row[0];
          const coverPhoto = album.coverPhoto || album.photos[0]?.photo;

          return (
            <div
              key={album.id}
              className={rowIndex === 0 ? "" : "mt-32 md:mt-44 lg:mt-56"}
              style={{ paddingLeft: pos.left }}
            >
              <Link
                href={`/work/${album.slug}`}
                className="group inline-block"
                style={{ width: `min(${pos.width}px, 80vw)` }}
              >
                {coverPhoto ? (
                  <Image
                    src={coverPhoto.cloudinaryUrl}
                    alt={album.name}
                    width={coverPhoto.width}
                    height={coverPhoto.height}
                    className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                    sizes={`${pos.width}px`}
                  />
                ) : (
                  <div className="bg-white/5 aspect-[4/5]" />
                )}
                <p className="text-[11px] text-white/40 mt-3 tracking-[0.15em] uppercase font-body">
                  {album.name}
                </p>
              </Link>
            </div>
          );
        } else {
          const pos = pairPositions[pairCount % pairPositions.length];
          pairCount++;

          return (
            <div
              key={row.map((a) => a.id).join("-")}
              className="mt-32 md:mt-44 lg:mt-56 flex items-end"
              style={{ paddingLeft: pos.left, gap: pos.gap }}
            >
              {row.map((album, j) => {
                const coverPhoto =
                  album.coverPhoto || album.photos[0]?.photo;
                const w = pos.widths[j];
                return (
                  <Link
                    key={album.id}
                    href={`/work/${album.slug}`}
                    className="group inline-block flex-shrink-0"
                    style={{ width: `min(${w}px, 42vw)` }}
                  >
                    {coverPhoto ? (
                      <Image
                        src={coverPhoto.cloudinaryUrl}
                        alt={album.name}
                        width={coverPhoto.width}
                        height={coverPhoto.height}
                        className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                        sizes={`${w}px`}
                      />
                    ) : (
                      <div className="bg-white/5 aspect-[4/5]" />
                    )}
                    <p className="text-[11px] text-white/40 mt-3 tracking-[0.15em] uppercase font-body">
                      {album.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
}
