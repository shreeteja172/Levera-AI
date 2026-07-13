"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth-client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    try {
      setLoading(true);

      await signInWithEmail(email, password, "/home");

      alert("Signed in successfully!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full rounded bg-black p-2 text-white"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <button
          onClick={() => signInWithGoogle("/home")}
          className="w-full rounded border p-2"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}