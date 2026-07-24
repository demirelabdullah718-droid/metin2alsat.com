const advantages = [
  {
    title: "Akilli Arama",
    text: "Sunucu, karakter, build ve urun bilgisine gore site icinde hizli arama yap.",
  },
  {
    title: "Guncel Fiyat Analizi",
    text: "Benzer ilanlari inceleyerek urunlerin guncel piyasa degerini daha kolay karsilastir.",
  },
  {
    title: "Duzenli Ilan Sistemi",
    text: "Spam mesajlar arasinda kaybolmadan filtrelenmis ilanlara tek platformdan ulas.",
  },
  {
    title: "Yonetim Destegi",
    text: "Guvenli ticaret ve resmi won islemleri icin yonetim ile WhatsApp uzerinden iletisime gec.",
  },
];

export default function WhyMetin2AlSat() {
  return (
    <section className="px-4 py-14 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-400">
            Neden Metin2AlSat?
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-white md:text-5xl">
            Ilan Karmasasina Daha Hizli Bir Cozum
          </h2>

          <p className="mt-5 leading-8 text-slate-300">
            Metin2AlSat.com; Facebook ve WhatsApp gruplarinda yasanan ilan
            karmasasi, spam paylasimlar ve fiyat belirsizligine cozum sunmak
            amaciyla kurulmustur. Oyuncularin aradigi urune daha hizli ulasmasi,
            fiyatlari karsilastirmasi ve duzenli bir ticaret ortamina kavusmasi
            hedeflenmektedir.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {advantages.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-xl"
            >
              <div className="mb-4 h-1 w-14 rounded-full bg-yellow-400" />
              <h3 className="text-xl font-bold text-yellow-400">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}