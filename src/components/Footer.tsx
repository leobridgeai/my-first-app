export default function Footer() {
  return (
    <footer className="border-t border-border py-6">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-center text-xs text-muted tracking-wide">
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  );
}
