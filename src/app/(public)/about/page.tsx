export const metadata = {
  title: "About | Portrait Photography",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-heading mb-10">About</h1>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Placeholder portrait */}
        <div className="aspect-[3/4] bg-gray-100 rounded-sm flex items-center justify-center">
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
            <p className="text-sm">Photographer portrait</p>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h2 className="text-xl font-heading mb-4">The Photographer</h2>
          <div className="space-y-4 text-muted leading-relaxed">
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

          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-sm tracking-widest uppercase text-foreground mb-4">
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
                  className="px-3 py-1 text-xs tracking-wide border border-gray-200 text-muted"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
