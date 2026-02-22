import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

export const metadata = {
  title: "About",
  description:
    "About Leonard Canitrot. Street portrait photographer. Raw, direct, unapologetic.",
};

export const dynamic = "force-dynamic";

async function getAboutContent() {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: { in: ["aboutQuote", "aboutBio", "aboutImageUrl", "aboutEnabled"] },
    },
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  return {
    enabled: map.aboutEnabled !== "false",
    quote: map.aboutQuote || "",
    bio: map.aboutBio || "",
    imageUrl: map.aboutImageUrl || "",
  };
}

export default async function AboutPage() {
  const content = await getAboutContent();

  if (!content.enabled) {
    notFound();
  }

  // Split bio on blank lines to create paragraphs
  const paragraphs = content.bio
    ? content.bio.split(/\n\s*\n/).filter((p) => p.trim())
    : [];

  return (
    <div className="pt-14 md:pt-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-10 md:py-24">
        {/* Bold header */}
        <div className="mb-10 md:mb-24">
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-heading font-bold tracking-[-0.02em] uppercase leading-[0.85]">
            About
          </h1>
          <div className="harsh-divider w-12 md:w-24 mt-4 md:mt-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Portrait */}
          <div className="relative">
            <div className="aspect-[3/4] bg-surface border border-white/5 flex items-center justify-center overflow-hidden">
              {content.imageUrl ? (
                <Image
                  src={optimizeCloudinaryUrl(content.imageUrl, { width: 800 })}
                  alt="Portrait"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="text-center text-muted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 mx-auto mb-3 opacity-20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={0.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <p className="text-[10px] tracking-[0.3em] uppercase">
                    Self portrait
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 tracking-tight uppercase">
              The Photographer
            </h2>
            <div className="space-y-6 text-muted leading-relaxed text-[15px]">
              {content.quote && (
                <p className="text-white/90 text-lg md:text-xl leading-relaxed font-heading italic">
                  &ldquo;{content.quote}&rdquo;
                </p>
              )}
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph.trim()}</p>
                ))
              ) : (
                <>
                  <p className="text-white/90 text-lg md:text-xl leading-relaxed font-heading italic">
                    &ldquo;I get close because that&apos;s the only way to get
                    to the truth of a face.&rdquo;
                  </p>
                  <p>
                    The streets are my studio. The flash is my paintbrush. Every
                    face tells a story that most people walk past without seeing.
                    I don&apos;t walk past.
                  </p>
                  <p>
                    My work is raw, direct, and unapologetic. I photograph
                    people as they are &mdash; not as they want to be seen. The
                    beauty is in the imperfection, in the character lines, in the
                    unguarded moment.
                  </p>
                  <p>
                    High contrast. Close range. No soft focus. No flattery. Just
                    the honest, brutal poetry of a human face.
                  </p>
                </>
              )}
            </div>

            <div className="mt-12 pt-12 border-t border-white/10">
              <h3 className="text-[10px] tracking-[0.35em] uppercase text-white/60 mb-6 font-semibold">
                Approach
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Street Portraits",
                  "High Contrast",
                  "Black & White",
                  "Close-Up",
                  "Flash Photography",
                  "Raw & Unfiltered",
                ].map((specialty) => (
                  <span
                    key={specialty}
                    className="px-4 py-2 text-[10px] tracking-[0.2em] uppercase border border-white/10 text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all duration-200"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
