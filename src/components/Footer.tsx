export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} Portrait Photography. All rights reserved.</p>
      </div>
    </footer>
  );
}
