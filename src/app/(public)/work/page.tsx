import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Work | Portrait Photography",
};

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

  return (
    <div className="pt-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading tracking-tight mb-16">
          Work
        </h1>

        {albums.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p>No work yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {albums.map((album) => {
              const coverPhoto = album.coverPhoto || album.photos[0]?.photo;
              return (
                <Link
                  key={album.id}
                  href={`/work/${album.slug}`}
                  className="group block relative"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                    {coverPhoto ? (
                      <Image
                        src={coverPhoto.cloudinaryUrl}
                        alt={album.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-12 h-12 opacity-30"
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
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-end">
                      <div className="p-6 md:p-8 w-full translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <h2 className="text-white text-xl md:text-2xl font-heading tracking-tight">
                          {album.name}
                        </h2>
                        {album.description && (
                          <p className="text-white/60 text-sm mt-1">
                            {album.description}
                          </p>
                        )}
                        <p className="text-white/40 text-xs mt-2 tracking-wide">
                          {album._count.photos}{" "}
                          {album._count.photos === 1 ? "photo" : "photos"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Title always visible below image */}
                  <div className="mt-3">
                    <h2 className="text-sm tracking-[0.15em] uppercase text-white/80 group-hover:text-white transition-colors">
                      {album.name}
                    </h2>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
