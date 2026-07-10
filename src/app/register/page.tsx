"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setMessage("Kayit olusturuluyor...");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage("Hata: " + error.message);
      return;
    }

    setMessage("Kayit basarili. E-postani kontrol et veya giris yap.");
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/",
      },
    });

    if (error) {
      setMessage("Google kayit hatasi: " + error.message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">
          Kayit Ol
        </h1>

        <p className="text-slate-400 mb-6">
          Yeni hesap olustur.
        </p>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full bg-white hover:bg-slate-200 text-black py-3 rounded-xl font-bold mb-5"
        >
          Google ile Kayit Ol
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px bg-slate-700 flex-1" />
          <span className="text-slate-500 text-sm">veya</span>
          <div className="h-px bg-slate-700 flex-1" />
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm text-slate-300">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Sifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold"
          >
            Kayit Ol
          </button>
        </form>

        {message && <p className="mt-5 text-sm text-slate-300">{message}</p>}

        <p className="text-slate-400 text-sm mt-6">
          Zaten hesabin var mi?{" "}
          <a href="/login" className="text-yellow-400 font-bold">
            Giris yap
          </a>
        </p>

        <a href="/" className="block text-yellow-400 font-bold mt-5">
          Ana sayfaya don
        </a>
      </div>
    </main>
  );
}