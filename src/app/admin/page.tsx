"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  server: string;
  price: number;
  description: string;
  image_url: string | null;
  status: string;
  created_at: string;
  seller_phone?: string;
};

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function fetchPendingListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("İlanlar çekilirken hata oluştu: " + error.message);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPendingListings();
  }, []);

  // İlan Onayla
  async function handleApprove(id: string) {
    setActionLoading(id);
    setMessage("");

    const { error } = await supabase
      .from("listings")
      .update({ status: "active", rejection_reason: null })
      .eq("id", id);

    if (error) {
      setMessage("Hata: " + error.message);
    } else {
      setMessage("İlan onaylandı ve yayına alındı.");
      setListings((prev) => prev.filter((item) => item.id !== id));
    }
    setActionLoading(null);
  }

  // İlan Reddet (Neden Belirterek)
  async function handleReject(id: string) {
    const reason = window.prompt("İlanı reddetme sebebini yazınız:");
    if (!reason) return; // İptal edilirse işlem yapma

    setActionLoading(id);
    setMessage("");

    const { error } = await supabase
      .from("listings")
      .update({ 
        status: "rejected", 
        rejection_reason: reason 
      })
      .eq("id", id);

    if (error) {
      setMessage("Hata: " + error.message);
    } else {
      setMessage("İlan reddedildi ve kullanıcıya sebebi iletildi.");
      setListings((prev) => prev.filter((item) => item.id !== id));
    }
    setActionLoading(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">
            Yönetim Paneli - İlan Onayları
          </h1>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-xl font-bold"
          >
            Ana Sayfa
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-slate-900 border border-yellow-500/30 rounded-xl text-yellow-400">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Onay bekleyen ilanlar yükleniyor...</p>
        ) : listings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            🎉 Onay bekleyen hiçbir ilan bulunmuyor!
          </div>
        ) : (
          <div className="grid gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start justify-between"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-32 h-32 object-cover rounded-xl border border-slate-800"
                  />
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-xs px-3 py-1 rounded-lg font-bold">
                      {item.category}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-lg font-bold">
                      {item.server}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white">{item.title}</h2>
                  <p className="text-yellow-400 text-xl font-extrabold">
                    {item.price} TL
                  </p>

                  <p className="text-slate-400 text-sm whitespace-pre-line">
                    {item.description || "Açıklama girilmemiş."}
                  </p>

                  {item.seller_phone && (
                    <p className="text-slate-500 text-xs">
                      İletişim: {item.seller_phone}
                    </p>
                  )}
                </div>

                <div className="flex md:flex-col gap-3 w-full md:w-auto">
                  <button
                    disabled={actionLoading === item.id}
                    onClick={() => handleApprove(item.id)}
                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50"
                  >
                    {actionLoading === item.id ? "İşleniyor..." : "✅ Onayla"}
                  </button>

                  <button
                    disabled={actionLoading === item.id}
                    onClick={() => handleReject(item.id)}
                    className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50"
                  >
                    ❌ Nedeniyle Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}