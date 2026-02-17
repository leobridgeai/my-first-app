import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="pt-16 min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
