import { INSTAGRAM_URL } from "@/lib/metadata";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-medium">
          &copy; {new Date().getFullYear()} Leonard Canitrot
        </p>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] tracking-[0.3em] uppercase text-white/20 hover:text-white/60 transition-colors duration-200"
        >
          Instagram
        </a>

        <p className="text-[10px] tracking-[0.3em] uppercase text-white/20">
          Raw portraits. No apologies.
        </p>
      </div>
    </footer>
  );
}
