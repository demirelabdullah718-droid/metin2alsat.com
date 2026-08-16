"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Şifreler eşleşmiyor.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage("Hata: " + error.message);
      setLoading(false);
    } else {
      setMessage("Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  }

  return (
    <main className="min-h-screen bg-transparent text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold text-yellow-400 text-center mb-2">
          Yeni Şifre Belirle
        </h1>
        <p className="text-slate-400 text-center text-sm mb-6">
          Hesabınız için yeni bir şifre girin.
        </p>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm text-slate-300">Yeni Şifre</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black font-medium"
              placeholder="••••••••"
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
            {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </main>
  );
}