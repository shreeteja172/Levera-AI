"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth-client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    try {
      setLoading(true);

      await signUpWithEmail(
        name,
        email,
        password,
        "/home"
      );

      alert("Account created successfully!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-center text-2xl font-bold">Create Account</h1>

        <input
          type="text"
          placeholder="Name"
          className="w-full rounded border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          onClick={handleSignUp}
          disabled={loading}
          className="w-full rounded bg-black p-2 text-white"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <button
          onClick={() => signInWithGoogle("/home")}
          className="w-full rounded border p-2"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}