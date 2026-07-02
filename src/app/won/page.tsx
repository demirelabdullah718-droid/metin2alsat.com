"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type WonRate = {
  id: string;
  server: string;
  buy_price: number;
  sell_price: number;
  whatsapp: string;
  note: string | null;
  updated_at: string;
};

export default function WonPage() {
  const [rates, setRates] = useState<WonRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRates() {
      const { data, error } = await supabase
        .from("won_rates")
        .select("*")
        .in("server", ["Charon", "Lucifer"])
        .order("server", { ascending: true });

      if (error) {
        console.log("Won fiyatları alınamadı:", error.message);
        setLoading(false);
        return;
      }

      setRates(data || []);
      setLoading(false);
    }

    loadRates();
  }, []);

  function formatPrice(price: number) {
    return Number(price).toLocaleString("tr-TR");
  }

  function createWhatsAppLink(rate: WonRate, type: "buy" | "sell") {
    const phone = rate.whatsapp.replace(/\D/g, "");

    const message =
      type === "buy"
        ? `Merhaba, ${rate.server} sunucusunda won almak istiyorum. Güncel satış fiyatınız ${rate.sell_price} TL görünüyor.`
        : `Merhaba, ${rate.server} sunucusunda won satmak istiyorum. Güncel alış fiyatınız ${rate.buy_price} TL görünüyor.`;

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
      message
    )}`;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-yellow-400 font-bold">
          ← Ana sayfaya dön
        </a>

        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-400 mt-8">
          Resmi Won Al / Won Sat
        </h1>

        <p className="text-slate-300 mt-4 max-w-3xl leading-7">
          Bu bölümdeki won işlemleri doğrudan Metin2AlSat site sahibi ile kullanıcı arasında yapılır.
          Güncel fiyatlar piyasa ve stok durumuna göre değişebilir.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 my-8">
          <h2 className="text-2xl font-bold mb-3">Resmi İletişim</h2>
          <p className="text-slate-300">
            WhatsApp: <span className="font-bold text-green-400">0507 668 07 24</span>
          </p>
        </div>

        {loading && (
          <p className="text-slate-400">Won fiyatları yükleniyor...</p>
        )}

        {!loading && rates.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-300">
              Henüz won fiyatı eklenmemiş.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {rates.map((rate) => (
            <div
              key={rate.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
            >
              <p className="text-sm text-yellow-400 font-bold">Sunucu</p>

              <h2 className="text-4xl font-extrabold mt-2">
                {rate.server}
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-2xl p-4">
                  <p className="text-slate-400 text-sm">Bizim Alış</p>
                  <p className="text-3xl font-extrabold text-red-400 mt-1">
                    {formatPrice(rate.buy_price)} TL
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sen won satarsan
                  </p>
                </div>

                <div className="bg-slate-800 rounded-2xl p-4">
                  <p className="text-slate-400 text-sm">Bizim Satış</p>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {formatPrice(rate.sell_price)} TL
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sen won alırsan
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={createWhatsAppLink(rate, "buy")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-4 rounded-xl font-bold text-center"
                >
                  {rate.server} Won Al
                </a>

                <a
                  href={createWhatsAppLink(rate, "sell")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-4 rounded-xl font-bold text-center"
                >
                  {rate.server} Won Sat
                </a>
              </div>

              <p className="text-xs text-slate-500 mt-5">
                Son güncelleme: {new Date(rate.updated_at).toLocaleString("tr-TR")}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-3">Bilgilendirme</h2>

          <ul className="list-disc list-inside text-slate-300 space-y-2 leading-7">
            <li>Fiyatlar stok ve piyasa durumuna göre değişebilir.</li>
            <li>İşlem yapmadan önce WhatsApp üzerinden güncel fiyatı teyit et.</li>
            <li>Teslimat sunucu yoğunluğuna göre değişebilir.</li>
            <li>Yanlış sunucu veya karakter bilgisi verilirse işlem gecikebilir.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
