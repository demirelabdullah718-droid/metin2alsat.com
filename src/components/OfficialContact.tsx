"use client";

const whatsappNumber = "905076680724";
const facebookMessageUrl = "https://m.me/abdullah.demirel.5030";

export default function OfficialContact() {
  const whatsappMessage =
    "Merhaba, Metin2AlSat.com resmi iletisim kanalindan yaziyorum.";

  const whatsappUrl =
    "https://api.whatsapp.com/send?phone=" +
    whatsappNumber +
    "&text=" +
    encodeURIComponent(whatsappMessage);

  return (
    <section
      id="resmi-iletisim"
      className="border-t border-slate-800 bg-[#050b16] px-4 py-14 md:px-8"
    >
      <div className="mx-auto max-w-5xl rounded-3xl border border-yellow-500/30 bg-slate-900 p-6 text-center shadow-2xl md:p-10">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
          Resmi Iletisim Kanallari
        </p>

        <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
          Yonetim Ekibine Dogrudan Ulasin
        </h2>

        <p className="mx-auto mt-4 max-w-3xl leading-7 text-slate-300">
          Ticaret onayi, ilan bildirimi, Won alim-satimi ve destek talepleriniz
          icin yalnizca asagidaki resmi iletisim kanallarini kullanin.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-black text-white transition hover:-translate-y-1 hover:bg-emerald-600"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm">
              WA
            </span>
            WhatsApp'tan Mesaj At
          </a>

          <a
            href={facebookMessageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-lg font-black text-white transition hover:-translate-y-1 hover:bg-blue-700"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm">
              FB
            </span>
            Facebook'tan Mesaj At
          </a>
        </div>

        <p className="mt-6 text-sm font-semibold text-red-300">
          Resmi kanallar disinda sizinle iletisime gecen kisilere odeme
          yapmayin ve hesap bilgilerinizi paylasmayin.
        </p>
      </div>
    </section>
  );
}
