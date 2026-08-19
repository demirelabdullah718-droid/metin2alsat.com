"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type WonRate = {
  id: string;
  server: string;
  buy_price: number;
  sell_price: number;
  whatsapp: string;
  updated_at?: string;
};

export default function WonPage() {
  const [rates, setRates] = useState<WonRate[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin düzenleme formu için state'ler
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuy, setEditBuy] = useState<number | ''>('');
  const [editSell, setEditSell] = useState<number | ''>('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    checkUserAndRates();
  }, []);

  async function checkUserAndRates() {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (user) {
      setUserEmail(user.email || null);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      setIsAdmin(!!profile?.is_admin);
    }

    const { data, error } = await supabase
      .from("won_rates")
      .select("*")
      .order("server", { ascending: true });

    if (!error && data) {
      setRates(data);
    }
    setLoading(false);
  }

  async function handleUpdateRate(id: string) {
    if (editBuy === '' || editSell === '') {
      alert("Lütfen alış ve satış fiyatlarını boş bırakma!");
      return;
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("won_rates")
      .update({
        buy_price: Number(editBuy),
        sell_price: Number(editSell),
        whatsapp: editWhatsapp,
        updated_at: now,
      })
      .eq("id", id);

    if (error) {
      alert("Güncellenirken hata oluştu: " + error.message);
    } else {
      setSuccessMsg("Fiyatlar anlık olarak güncellendi!");
      setEditingId(null);
      checkUserAndRates();
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  }

  return (
    <main className="min-h-screen bg-[#030812] text-white px-4 py-8 md:px-12">
      <div className="mx-auto max-w-6xl">
        
        {/* ÜST BAŞLIK VE GERİ DÖN */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-yellow-500/20 pb-5">
          <div>
            <button
              onClick={() => (window.location.href = "/")}
              className="text-sm font-semibold text-yellow-400 hover:underline mb-2 inline-block"
            >
              ← Ana Sayfaya Dön
            </button>
            <h1 className="text-3xl font-extrabold text-white">
              Resmi Won Al / Sat <span className="text-yellow-400">Kurları</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Piyasa koşullarına göre anlık güncellenen resmi kur tablosu (Dolar/Euro paritesi gibi canlı takip).
            </p>
          </div>

          {successMsg && (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-4 py-2 rounded-xl text-sm font-bold animate-pulse">
              {successMsg}
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-slate-400 text-center py-12">Kurlar yükleniyor...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rates.map((rate) => {
              const isEditing = editingId === rate.id;
              const formattedDate = rate.updated_at
                ? new Date(rate.updated_at).toLocaleString("tr-TR", {
                    timeZone: "Europe/Istanbul",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Henüz güncellenmedi";

              return (
                <div
                  key={rate.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative flex flex-col justify-between"
                >
                  <div>
                    {/* SUNUCU ADI VE PARİTE GÖSTERGESİ */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-yellow-400 flex items-center gap-2">
                        <span>🪙</span> {rate.server}
                      </h3>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                        Canlı Kur
                      </span>
                    </div>

                    {/* FİYAT KUTULARI (ALIŞ / SATIŞ) */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-center">
                        <p className="text-slate-400 text-xs font-medium mb-1">Site Alış (TL)</p>
                        <p className="text-red-400 text-xl font-extrabold">
                          {Number(rate.buy_price).toLocaleString("tr-TR")} ₺
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-center">
                        <p className="text-slate-400 text-xs font-medium mb-1">Site Satış (TL)</p>
                        <p className="text-emerald-400 text-xl font-extrabold">
                          {Number(rate.sell_price).toLocaleString("tr-TR")} ₺
                        </p>
                      </div>
                    </div>

                    {/* SON GÜNCELLEME TARİHİ */}
                    <div className="bg-slate-950/60 rounded-xl p-2.5 mb-4 text-center border border-slate-800/50">
                      <p className="text-[11px] text-slate-400">
                        Son Güncelleme: <span className="text-yellow-300 font-semibold">{formattedDate}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    {/* WHATSAPP İLETİŞİM BUTONLARI */}
                    {!isEditing && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <a
                          href={`https://api.whatsapp.com/send?phone=${rate.whatsapp || "905076680724"}&text=${encodeURIComponent(
                            `Merhaba, ${rate.server} sunucusunda won almak istiyorum. Sitedeki satış fiyatı: ${rate.sell_price} TL`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2.5 rounded-xl font-bold text-center transition shadow-md"
                        >
                          Won Al
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${rate.whatsapp || "905076680724"}&text=${encodeURIComponent(
                            `Merhaba, ${rate.server} sunucusunda won satmak istiyorum. Sitedeki alış fiyatı: ${rate.buy_price} TL`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs py-2.5 rounded-xl font-bold text-center transition shadow-md"
                        >
                          Won Sat
                        </a>
                      </div>
                    )}

                    {/* SADECE ADMIN GÖREBİLİR: DEĞİŞTİRME BUTONU VE FORMU */}
                    {userEmail && isAdmin && (
                      <div className="mt-2 pt-3 border-t border-slate-800">
                        {!isEditing ? (
                          <button
                            onClick={() => {
                              setEditingId(rate.id);
                              setEditBuy(rate.buy_price);
                              setEditSell(rate.sell_price);
                              setEditWhatsapp(rate.whatsapp || "905076680724");
                            }}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-yellow-500/30 py-2 rounded-xl text-xs font-bold transition"
                          >
                            ⚙️ Kuru / Fiyatı Güncelle
                          </button>
                        ) : (
                          <div className="bg-slate-950 p-3 rounded-xl border border-yellow-500/40 space-y-2">
                            <p className="text-xs font-bold text-yellow-400 text-center mb-1">Kur Düzenleme Paneli</p>
                            <div>
                              <label className="text-[10px] text-slate-400 block">Alış Fiyatı (TL)</label>
                              <input
                                type="number"
                                value={editBuy}
                                onChange={(e) => setEditBuy(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block">Satış Fiyatı (TL)</label>
                              <input
                                type="number"
                                value={editSell}
                                onChange={(e) => setEditSell(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block">WhatsApp Numarası</label>
                              <input
                                type="text"
                                value={editWhatsapp}
                                onChange={(e) => setEditWhatsapp(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white"
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleUpdateRate(rate.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1.5 rounded-lg font-bold"
                              >
                                Kaydet
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg font-bold"
                              >
                                İptal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}