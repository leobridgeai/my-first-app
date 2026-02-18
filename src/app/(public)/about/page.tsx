export const metadata = {
  title: "About | Portrait Photography",
};

export default function AboutPage() {
  return (
    <div className="pt-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading tracking-tight mb-16">
          About
        </h1>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Placeholder portrait */}
          <div className="aspect-[3/4] bg-surface flex items-center justify-center">
            <div className="text-center text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 mx-auto mb-3 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <p className="text-xs tracking-wide">Photographer portrait</p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className="text-2xl md:text-3xl font-heading mb-6 tracking-tight">
              The Photographer
            </h2>
            <div className="space-y-5 text-muted leading-relaxed text-[15px]">
              <p>
                Welcome to my portfolio. I&apos;m a portrait photographer with a
                passion for capturing the unique essence of every individual I
                work with.
              </p>
              <p>
                My approach combines natural light with thoughtful composition to
                create images that feel both timeless and authentic. Whether in
                the studio or on location, I aim to make every session a
                comfortable and creative experience.
              </p>
              <p>
                I specialize in studio portraits, outdoor sessions, and black
                &amp; white photography. Each project is an opportunity to tell a
                visual story that resonates.
              </p>
            </div>

            <div className="mt-10 pt-10 border-t border-border">
              <h3 className="text-[11px] tracking-[0.25em] uppercase text-white mb-5">
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Studio Portraits",
                  "Outdoor Sessions",
                  "Black & White",
                  "Editorial",
                  "Headshots",
                ].map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-1.5 text-xs tracking-wide border border-border text-muted hover:text-white hover:border-white/40 transition-colors"
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
