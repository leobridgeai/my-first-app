import { redirect } from "next/navigation";

// The site opens directly on the album grid — no "Enter" splash page.
export default function HomePage() {
  redirect("/work");
}
