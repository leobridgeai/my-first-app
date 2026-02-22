export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-center">
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-medium">
          &copy; {new Date().getFullYear()} Leonard Canitrot
        </p>
      </div>
    </footer>
  );
}
