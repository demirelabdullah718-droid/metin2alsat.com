"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage("Hata: " + error.message);
    } else {
      setMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-transparent text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold text-yellow-400 text-center mb-2">
          Şifremi Unuttum
        </h1>
        <p className="text-slate-400 text-center text-sm mb-6">
          Hesabınıza ait e-posta adresinizi girin, sıfırlama bağlantısını gönderelim.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm text-slate-300">E-Posta Adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black font-medium"
              placeholder="ornek@gmail.com"
              required
            />
          </div>

          {message && (
            <p className="text-sm p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-yellow-400 hover:underline font-bold">
            ← Giriş Sayfasına Dön
          </a>
        </div>
      </div>
    </main>
  );
}