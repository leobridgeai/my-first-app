import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Portfolio | Portrait Photography",
};

export default async function PortfolioPage() {
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-heading mb-3">Portfolio</h1>
      <p className="text-muted mb-10 max-w-lg">
        Browse through my collection of portrait photography.
      </p>

      {albums.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p>No albums yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => {
            const coverPhoto = album.coverPhoto || album.photos[0]?.photo;
            return (
              <Link
                key={album.id}
                href={`/portfolio/${album.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-gray-100">
                  {coverPhoto ? (
                    <Image
                      src={coverPhoto.cloudinaryUrl}
                      alt={album.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-12 h-12"
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
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <div className="mt-3">
                  <h2 className="font-heading text-lg">{album.name}</h2>
                  {album.description && (
                    <p className="text-sm text-muted mt-0.5">{album.description}</p>
                  )}
                  <p className="text-xs text-muted mt-1">
                    {album._count.photos} {album._count.photos === 1 ? "photo" : "photos"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
