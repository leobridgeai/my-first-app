"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-heading text-center mb-8 text-white">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded">
              {error}
            </div>
          )}

          <div suppressHydrationWarning>
            <label
              htmlFor="username"
              className="block text-[11px] tracking-[0.25em] uppercase text-white/50 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:border-white/40 focus:outline-none text-sm transition-colors"
              required
              suppressHydrationWarning
            />
          </div>

          <div suppressHydrationWarning>
            <label
              htmlFor="password"
              className="block text-[11px] tracking-[0.25em] uppercase text-white/50 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:border-white/40 focus:outline-none text-sm transition-colors"
              required
              suppressHydrationWarning
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black text-sm tracking-widest uppercase hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
