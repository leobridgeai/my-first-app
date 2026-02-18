import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Work | Raw Street Portraits",
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
    <div className="pt-16">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
        {/* Bold header */}
        <div className="mb-16 md:mb-20">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-[-0.02em] uppercase leading-[0.85]">
            Work
          </h1>
          <div className="harsh-divider w-16 md:w-24 mt-6" />
        </div>

        {albums.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/30 text-sm tracking-[0.2em] uppercase">No work yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {albums.map((album, index) => {
              const coverPhoto = album.coverPhoto || album.photos[0]?.photo;
              return (
                <Link
                  key={album.id}
                  href={`/work/${album.slug}`}
                  className="group block relative animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                    {coverPhoto ? (
                      <Image
                        src={coverPhoto.cloudinaryUrl}
                        alt={album.name}
                        fill
                        className="object-cover photo-harsh transition-transform duration-700 group-hover:scale-[1.05]"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-16 h-16 text-white/10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={0.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                          />
                        </svg>
                      </div>
                    )}
                    {/* Heavy dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-500 flex items-end">
                      <div className="p-6 md:p-8 w-full translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <h2 className="text-white text-2xl md:text-3xl font-heading font-bold tracking-tight uppercase">
                          {album.name}
                        </h2>
                        {album.description && (
                          <p className="text-white/50 text-sm mt-2">
                            {album.description}
                          </p>
                        )}
                        <p className="text-white/30 text-[10px] mt-3 tracking-[0.3em] uppercase">
                          {album._count.photos}{" "}
                          {album._count.photos === 1 ? "image" : "images"}
                        </p>
                      </div>
                    </div>

                    {/* Vignette on each image */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
                  </div>
                  {/* Title below - stark */}
                  <div className="mt-3 mb-6">
                    <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/50 group-hover:text-white transition-colors duration-300 font-medium">
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
