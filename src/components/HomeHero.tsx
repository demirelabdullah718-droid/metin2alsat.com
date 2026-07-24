"use client";

export default function HomeHero() {
  return (
    <section className="px-4 pt-5 md:px-8">
      <div className="relative min-h-[500px] overflow-hidden rounded-3xl border border-yellow-500/30 bg-slate-950 shadow-2xl md:min-h-[650px]">
        <img
          src="/images/metin2alsat-hero.webp"
          alt="Metin2AlSat"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/10" />

        <div className="relative z-10 flex min-h-[500px] items-end justify-center px-5 pb-10 md:min-h-[650px] md:pb-14">
          <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-center shadow-2xl backdrop-blur-md md:p-9">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
              Sadece Metin2 TR
            </p>

            <h1 className="text-3xl font-extrabold leading-tight text-yellow-400 md:text-6xl">
              Metin2 Turkiye Ticaret Merkezi
            </h1>

            <p className="mt-4 text-lg font-semibold text-white md:text-2xl">
              Aradigini Bul, Fiyatini Karsilastir, Guvenle Ticaret Yap
            </p>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Facebook ve WhatsApp gruplarindaki ilan karmasasinda kaybolmadan,
              aradigin urune hizla ulas ve guncel fiyatlari kolayca karsilastir.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("ilanlar")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="rounded-xl bg-yellow-400 px-8 py-4 font-bold text-black hover:bg-yellow-500"
              >
                Ilanlara Goz At
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = "/ilan-ver")}
                className="rounded-xl bg-emerald-500 px-8 py-4 font-bold text-white hover:bg-emerald-600"
              >
                Ilan Ver
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}