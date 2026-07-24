"use client";

import AnnouncementBar from "./AnnouncementBar";

type LandingHeaderProps = {
  userEmail: string | null;
  onLogout: () => void;
};

export default function LandingHeader({
  userEmail,
  onLogout,
}: LandingHeaderProps) {
  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-[#030812]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-3 px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="shrink-0 whitespace-nowrap text-xl font-extrabold text-white md:text-3xl"
          >
            Metin2<span className="text-yellow-400">alsat.com</span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            <a
              href="/"
              className="rounded-lg px-4 py-2 font-semibold text-yellow-400 hover:bg-white/5"
            >
              Ana Sayfa
            </a>

            <a
              href="/#ilanlar"
              className="rounded-lg px-4 py-2 font-semibold text-slate-200 hover:bg-white/5 hover:text-yellow-400"
            >
              İlanlar
            </a>

            <a
              href="/won"
              className="rounded-lg px-4 py-2 font-semibold text-slate-200 hover:bg-white/5 hover:text-yellow-400"
            >
              Won Al / Sat
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/#ticaret-kurallari"
              className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-3 py-2 text-center text-xs font-black text-black transition hover:bg-yellow-500 md:px-5 md:text-sm"
            >
              Ticaret Nasıl Yapılır?
            </a>

            {userEmail ? (
              <>
                <span className="hidden max-w-40 truncate text-sm text-slate-300 xl:block">
                  {userEmail}
                </span>

                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-500 hover:text-white"
                >
                  Çıkış
                </button>
              </>
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
              className="hidden rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-600 md:block"
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
