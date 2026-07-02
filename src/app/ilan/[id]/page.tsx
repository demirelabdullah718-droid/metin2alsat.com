"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  server: string;
  price: number;
  seller_phone: string | null;
  image_url: string | null;
  description: string | null;
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
        console.log("İlan detay hatası:", error.message);
        setLoading(false);
        return;
      }

      setListing(data);
      setLoading(false);
    }

    if (id) {
      loadPage();
    }
  }, [id]);

  function categoryIcon(category: string) {
    if (category === "Karakter") return "🛡️";
    if (category === "Yang") return "💰";
    if (category === "Won") return "💎";
    if (category === "Eşya") return "⚔️";
    if (category === "EP") return "⚡";
    if (category === "Hesap") return "📦";
    return "🎮";
  }

  function createWhatsAppLink() {
    if (!listing?.seller_phone) return "#";

    let phone = listing.seller_phone.replace(/\D/g, "");

    if (phone.startsWith("0")) {
      phone = "90" + phone.substring(1);
    }

    if (phone.startsWith("5")) {
      phone = "90" + phone;
    }

    const message = `Merhaba, Metin2AlSat üzerindeki "${listing.title}" ilanınız hakkında bilgi almak istiyorum.`;

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
      message
    )}`;
  }

  async function handleDelete() {
    if (!listing || !currentUserId) {
      return;
    }

    const confirmDelete = window.confirm(
      "Bu ilanı silmek istediğine emin misin?"
    );

    if (!confirmDelete) {
      return;
    }

    setDeleteMessage("İlan siliniyor...");

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      setDeleteMessage("Silme hatası: " + error.message);
      return;
    }

    setDeleteMessage("İlan silindi. Ana sayfaya yönlendiriliyorsun...");

    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-300">İlan yükleniyor...</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">İlan bulunamadı.</p>
          <a href="/" className="text-yellow-400 font-bold">
            Ana sayfaya dön
          </a>
        </div>
      </main>
    );
  }

  const isOwner = currentUserId === listing.user_id;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-yellow-400 font-bold">
          ← Ana sayfaya dön
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

            <div className="mt-8 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-bold mb-3">İlan Açıklaması</h2>

              <p className="text-slate-300 leading-7">
                {listing.description || "Bu ilan için açıklama girilmemiş."}
              </p>
            </div>

            <div className="mt-8 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-bold mb-3">Satıcı İletişim</h2>

              {listing.seller_phone ? (
                <p className="text-slate-300">
                  WhatsApp: {listing.seller_phone}
                </p>
              ) : (
                <p className="text-slate-500">
                  Bu ilanda WhatsApp numarası yok.
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4">
              {listing.seller_phone ? (
                <a
                  href={createWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 px-6 py-4 rounded-xl font-bold text-center"
                >
                  WhatsApp ile İletişime Geç
                </a>
              ) : (
                <button
                  disabled
                  className="bg-slate-700 px-6 py-4 rounded-xl font-bold text-slate-400 cursor-not-allowed"
                >
                  WhatsApp Numarası Yok
                </button>
              )}

              <button className="bg-blue-500 hover:bg-blue-600 px-6 py-4 rounded-xl font-bold">
                Satıcıya Mesaj Gönder
              </button>
            </div>

            {isOwner && (
              <div className="mt-8 border-t border-slate-800 pt-6">
                <h2 className="text-xl font-bold mb-4">İlan Yönetimi</h2>

                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={() =>
                      (window.location.href = `/ilan-duzenle/${listing.id}`)
                    }
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-4 rounded-xl font-bold"
                  >
                    İlanı Güncelle
                  </button>

                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl font-bold"
                  >
                    İlanı Sil
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
