"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setMessage("Giriş yapılıyor...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Hata: " + error.message);
      return;
    }

    if (data.user?.email) {
      localStorage.setItem("metin2alsat_user_email", data.user.email);
    }

    setMessage("Giriş başarılı! Ana sayfaya yönlendiriliyorsun...");

    setTimeout(() => {
      window.location.href = "/";
    }, 700);
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/",
      },
    });

    if (error) {
      setMessage("Google giriş hatasi: " + error.message);
    }
  }

  async function signInWithFacebook() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: window.location.origin + "/",
      },
    });

    if (error) {
      setMessage("Facebook giriş hatasi: " + error.message);
    }
  }

  return (
    <main className="min-h-screen bg-transparent text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">
          Metin2AlSat
        </h1>

        <p className="text-slate-400 mb-6">Hesabına giriş yap</p>

        {/* Sosyal Butonlar */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full bg-white hover:bg-slate-200 text-black py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <span>🌐</span> Google
          </button>

          <button
            type="button"
            onClick={signInWithFacebook}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <span>📘</span> Facebook
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px bg-slate-700 flex-1" />
          <span className="text-slate-500 text-sm">veya e-posta ile</span>
          <div className="h-px bg-slate-700 flex-1" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta adresin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-4 py-3 bg-white text-black placeholder:text-gray-500"
            required
          />

          <div>
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black placeholder:text-gray-500"
              required
            />
            
            <div className="text-right mt-2">
              <a 
                href="/forgot-password" 
                className="text-xs text-yellow-400 hover:underline font-semibold"
              >
                Şifremi Unuttum?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold transition-colors"
          >
            Giriş Yap
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-400">
          Hesabın yok mu?{" "}
          <a href="/register" className="text-yellow-400 font-bold">
            Kayıt Ol
          </a>
        </p>

        {message && <p className="mt-5 text-sm text-slate-300">{message}</p>}
      </div>
    </main>
  );
}