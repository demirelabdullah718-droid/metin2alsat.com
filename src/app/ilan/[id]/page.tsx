"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type CharacterDetails = {
  class?: string;
  build?: string;
  biolog?: string;
  alchemy?: Record<string, string>;
  alchemyBonuses?: Record<string, string[]>;
  marketExtras?: string[];
};

type Listing = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  server: string;
  price: number;
  seller_phone: string | null;
  image_url: string | null;
  listing_duration_days: number | null;
  max_delivery_hours: number | null;
  expires_at: string | null;
  description: string | null;
  character_details: CharacterDetails | null;
  created_at: string;
};

export default function IlanDetayPage() {
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    async function loadPage() {
      const { data: sessionData } = await supabase.auth.getSession();
      setCurrentUserId(sessionData.session?.user.id ?? null);

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log("Ilan detay hatasi:", error.message);
        setLoading(false);
        return;
      }

      setListing(data);
      setLoading(false);
    }

    if (id) loadPage();
  }, [id]);

  function categoryIcon(category: string) {
    if (category === "Karakter") return "K";
    if (category === "Yang") return "Y";
    if (category === "Won Al") return "WA";
    if (category === "Won Sat") return "WS";
    if (category === "Esya" || category === "Eşya") return "E";
    if (category === "EP") return "EP";
    if (category === "Hesap") return "H";
    return "O";
  }

  function createWhatsAppLink() {
    if (!listing?.seller_phone) return "#";

    let phone = listing.seller_phone.replace(/\D/g, "");

    if (phone.startsWith("0")) phone = "90" + phone.substring(1);
    if (phone.startsWith("5")) phone = "90" + phone;

    const message = `Merhaba, Metin2AlSat uzerindeki "${listing.title}" ilani hakkinda bilgi almak istiyorum.`;

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
      message
    )}`;
  }

  function formatDate(date: string | null) {
    if (!date) return "Belirtilmedi";
    return new Date(date).toLocaleDateString("tr-TR");
  }

  async function handleDelete() {
    if (!listing || !currentUserId) return;

    const confirmDelete = window.confirm(
      "Bu ilani silmek istedigine emin misin?"
    );

    if (!confirmDelete) return;

    setDeleteMessage("Ilan siliniyor...");

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      setDeleteMessage("Silme hatasi: " + error.message);
      return;
    }

    setDeleteMessage("Ilan silindi. Ana sayfaya yonlendiriliyorsun...");

    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-300">Ilan yukleniyor...</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Ilan bulunamadi.</p>
          <a href="/" className="text-yellow-400 font-bold">
            Ana sayfaya don
          </a>
        </div>
      </main>
    );
  }

  const isOwner = currentUserId === listing.user_id;
  const details = listing.character_details || {};
  const hasCharacterDetails =
    listing.category === "Karakter" || listing.category === "Hesap";

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-yellow-400 font-bold">
          Ana sayfaya don
        </a>

        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full max-h-[420px] object-cover"
            />
          ) : (
            <div className="h-72 flex items-center justify-center text-7xl bg-slate-800">
              {categoryIcon(listing.category)}
            </div>
          )}

          <div className="p-8">
            <div className="text-sm text-yellow-400 font-bold">
              {listing.category}
            </div>

            <h1 className="text-4xl font-extrabold mt-3">{listing.title}</h1>

            <p className="text-slate-400 mt-3">Sunucu: {listing.server}</p>

            <p className="text-emerald-400 text-4xl font-extrabold mt-6">
              {Number(listing.price).toLocaleString("tr-TR")} TL
            </p>

            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm">Ilan Suresi</p>
                <p className="font-bold mt-1">
                  {listing.listing_duration_days || 7} Gun
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm">Maksimum Teslimat</p>
                <p className="font-bold mt-1">
                  {listing.max_delivery_hours || 24} Saat
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm">Ilan Bitis Tarihi</p>
                <p className="font-bold mt-1">{formatDate(listing.expires_at)}</p>
              </div>
            </div>

            {hasCharacterDetails && (
              <div className="mt-8 border-t border-slate-800 pt-6">
                <h2 className="text-2xl font-bold text-yellow-400 mb-5">
                  Karakter / Hesap Detaylari
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800 rounded-2xl p-5">
                    <p className="text-slate-400 text-sm">Karakter Sinifi</p>
                    <p className="text-xl font-bold mt-1">
                      {details.class || "Belirtilmedi"}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-2xl p-5">
                    <p className="text-slate-400 text-sm">Panel / Build</p>
                    <p className="text-xl font-bold mt-1">
                      {details.build || "Belirtilmedi"}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-2xl p-5 mb-6">
                  <p className="text-slate-400 text-sm">Biyolog Durumu</p>
                  <p className="font-bold mt-1">
                    {details.biolog || "Belirtilmedi"}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4">Simya Paneli</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {details.alchemy &&
                      Object.entries(details.alchemy).map(([stone, purity]) => (
                        <div
                          key={stone}
                          className="bg-slate-800 rounded-2xl p-4 border border-slate-700"
                        >
                          <p className="text-yellow-400 font-bold">{stone}</p>
                          <p className="text-slate-200 mt-1">{purity}</p>

                          {details.alchemyBonuses?.[stone] &&
                            details.alchemyBonuses[stone].length > 0 && (
                              <div className="mt-2 space-y-1">
                                {details.alchemyBonuses[stone].map((bonus) => (
                                  <p
                                    key={bonus}
                                    className="text-xs text-slate-400 leading-5"
                                  >
                                    - {bonus}
                                  </p>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    Nesne Market Ek Urunler
                  </h3>

                  {details.marketExtras && details.marketExtras.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {details.marketExtras.map((extra) => (
                        <span
                          key={extra}
                          className="bg-blue-500/20 border border-blue-500 text-blue-200 px-4 py-2 rounded-xl font-bold"
                        >
                          {extra}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">Ek urun belirtilmedi.</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-bold mb-3">Ilan Aciklamasi</h2>
              <p className="text-slate-300 leading-7">
                {listing.description || "Bu ilan icin aciklama girilmemis."}
              </p>
            </div>

            <div className="mt-8 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-bold mb-3">Satici Iletisim</h2>

              {listing.seller_phone ? (
                <p className="text-slate-300">
                  WhatsApp: {listing.seller_phone}
                </p>
              ) : (
                <p className="text-slate-500">
                  Bu ilanda WhatsApp numarasi yok.
                </p>
              )}
            </div>

            <div className="mt-8">
              {listing.seller_phone ? (
                <a
                  href={createWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-green-500 hover:bg-green-600 px-6 py-4 rounded-xl font-bold text-center"
                >
                  WhatsApp ile Iletisime Gec
                </a>
              ) : (
                <button
                  disabled
                  className="w-full bg-slate-700 px-6 py-4 rounded-xl font-bold text-slate-400 cursor-not-allowed"
                >
                  WhatsApp Numarasi Yok
                </button>
              )}
            </div>

            {isOwner && (
              <div className="mt-8 border-t border-slate-800 pt-6">
                <h2 className="text-xl font-bold mb-4">Ilan Yonetimi</h2>

                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={() =>
                      (window.location.href = `/ilan-duzenle/${listing.id}`)
                    }
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-4 rounded-xl font-bold"
                  >
                    Ilani Guncelle
                  </button>

                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl font-bold"
                  >
                    Ilani Sil
                  </button>
                </div>

                {deleteMessage && (
                  <p className="mt-4 text-sm text-slate-300">
                    {deleteMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}