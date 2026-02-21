import { INSTAGRAM_URL } from "@/lib/metadata";

export default function Footer() {
  return (
    <footer className="border-t border-[#eee] py-8 bg-white">
      <div className="max-w-[960px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#aaa]">
          &copy; {new Date().getFullYear()} Leonard Canitrot
        </p>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] tracking-[0.2em] uppercase text-[#aaa] hover:text-[#555]"
        >
          Instagram
        </a>

        <p className="text-[9px] tracking-[0.15em] text-[#ccc]">
          Raw portraits. No apologies.
        </p>
      </div>
    </footer>
  );
}
