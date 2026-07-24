"use client";

export default function AnnouncementBar() {
  return (
    <section className="relative z-[60] border-b border-yellow-300/50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black">
      <div className="mx-auto max-w-[1700px] px-4 py-3 md:px-8">
        <div className="flex flex-col items-center justify-between gap-3 xl:flex-row">
          <div className="min-w-0 text-center xl:text-left">
            <p className="text-sm font-black tracking-[0.14em] md:text-base">
              BU SİTE SADECE METİN2 TR OYUNCULARI İÇİNDİR
            </p>

            <p className="mt-1 text-xs font-semibold leading-5 md:text-sm">
              Metin2AlSat.com; Facebook ve WhatsApp gruplarındaki spam ve
              bilgi karmaşasını azaltmak, oyuncuların aradıkları
              ürünlere ve güncel fiyatlara daha kolay ulaşmasını
              sağlamak için kurulmuştur. Yönetim onayı alınmadan
              yapılan işlemler platform güvencesi kapsamında değildir.
            </p>
          </div>

          <a
            href="/#ticaret-kurallari"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-black text-yellow-400 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-900"
          >
            Ticaret Nasıl Yapılır?
          </a>
        </div>
      </div>
    </section>
  );
}
