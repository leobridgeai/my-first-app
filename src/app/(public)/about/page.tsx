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

  const paragraphs = content.bio
    ? content.bio.split(/\n\s*\n/).filter((p) => p.trim())
    : [];

  return (
    <div className="bg-white pt-[56px]">
      <div className="max-w-[960px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Portrait */}
          <div className="relative">
            <div className="aspect-[3/4] bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
              {content.imageUrl ? (
                <Image
                  src={optimizeCloudinaryUrl(content.imageUrl, { width: 800 })}
                  alt="Portrait"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="text-center text-[#ccc]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 mx-auto mb-3 opacity-30"
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
                  <p className="text-[10px] tracking-[0.2em] uppercase">
                    Self portrait
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            {content.quote && (
              <p className="text-[14px] leading-relaxed text-[#444] italic mb-8">
                &ldquo;{content.quote}&rdquo;
              </p>
            )}
            <div className="space-y-5 text-[#555] leading-relaxed text-[14px]">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph.trim()}</p>
                ))
              ) : (
                <>
                  <p className="text-[#333] italic">
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
                </>
              )}
            </div>

            <div className="mt-12 pt-10 border-t border-[#eee]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#aaa] mb-4">
                Approach
              </p>
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
                    className="px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase border border-[#ddd] text-[#888] hover:text-[#333] hover:border-[#999]"
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
