"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AnnouncementBar from "./AnnouncementBar";

type LandingHeaderProps = {
  userEmail: string | null;
  onLogout: () => void;
};

export default function LandingHeader({
  userEmail,
  onLogout,
}: LandingHeaderProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, [userEmail]);

  async function checkAdmin() {
    if (!userEmail) {
      setIsAdmin(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    setIsAdmin(!!data?.is_admin);
  }

  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-[#030812]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          
          {/* LOGO VE SOL MENÜ */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="shrink-0 whitespace-nowrap text-xl font-extrabold text-white md:text-3xl"
            >
              Metin2<span className="text-yellow-400">alsat.com</span>
            </button>

            <nav className="flex items-center gap-1 flex-wrap">
              <a
                href="/#ilanlar"
                className="rounded-lg px-2.5 py-2 font-semibold text-slate-200 hover:bg-white/5 hover:text-yellow-400 text-sm md:text-base"
              >
                İlanlar
              </a>

              <a
                href="/won"
                className="rounded-lg px-2.5 py-2 font-semibold text-slate-200 hover:bg-white/5 hover:text-yellow-400 text-sm md:text-base"
              >
                Won Al / Sat
              </a>

              {userEmail && (
                <a
                  href="/ilanlarim"
                  className="rounded-lg px-2.5 py-2 font-semibold text-slate-200 hover:bg-white/5 hover:text-yellow-400 text-sm md:text-base"
                >
                  İlanlarım
                </a>
              )}
            </nav>
          </div>

          {/* SAĞ KULLANICI & MESAJLAR / PROFİL BLOKU (ÜSTTEN TİCARET NASIL YAPILIR KALDIRILDI) */}
          <div className="flex items-center gap-2 flex-wrap">
            {userEmail && (
              <>
                <a
                  href="/mesajlar"
                  className="rounded-xl bg-yellow-400/20 border border-yellow-400/40 px-3.5 py-2 text-sm font-bold text-yellow-300 hover:bg-yellow-400/30 flex items-center gap-1.5 shadow-md"
                >
                  <span>💬</span> Mesajlar
                </a>

                <a
                  href="/profil"
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-sm font-bold text-white flex items-center gap-1.5"
                >
                  <span>👤</span> Profilim
                </a>
              </>
            )}

            {userEmail && isAdmin && (
              <a
                href="/admin"
                className="rounded-xl border border-yellow-400/60 bg-yellow-400/20 px-3 py-2 text-sm font-black text-yellow-300 hover:bg-yellow-400/30"
              >
                👑 Yönetim
              </a>
            )}

            {userEmail ? (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-500 hover:text-white"
              >
                Çıkış Yap
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white hover:border-yellow-400"
                >
                  Giriş
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/register";
                  }}
                  className="hidden rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 sm:block"
                >
                  Kayıt Ol
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                window.location.href = "/ilan-ver";
              }}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 shadow-md"
            >
              İlan Ver
            </button>
          </div>

        </div>
      </header>

      <section className="border-b border-yellow-500/20 bg-black">
        <div className="w-full">
          <img
            src="/images/metin2alsat-hero.webp"
            alt="Metin2AlSat Ticaret Sohbet Grubu"
            className="block h-auto w-full"
          />
        </div>
      </section>
    </>
  );
}