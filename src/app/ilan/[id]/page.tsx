"use client";
import PurchaseButton from "../../../components/PurchaseButton";
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

type SellerProfile = {
  id: string;
  email?: string;
  is_verified?: boolean;
  total_sales?: number;
  positive_reviews?: number;
  negative_reviews?: number;
  last_seen?: string;
};

type Listing = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  server: string;
  price: number;
  image_url: string | null;
  description: string | null;
  character_details: CharacterDetails | null;
  created_at: string;
  seller_phone: string | null;
  listing_duration_days: number | null;
  max_delivery_hours: number | null;
  expires_at: string | null;
  status: string | null;
};

export default function IlanDetayPage() {
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [otherListingsCount, setOtherListingsCount] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mesaj Gönderme Modal State'leri
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    async function loadPage() {
      const { data: sessionData } = await supabase.auth.getSession();
      setCurrentUserId(sessionData.session?.user.id ?? null);

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (listingError || !listingData) {
        console.log("Ilan detay hatasi:", listingError?.message);
        setLoading(false);
        return;
      }

      setListing(listingData);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", listingData.user_id)
        .single();

      if (profileData) {
        setSeller(profileData);
      } else {
        setSeller({
          id: listingData.user_id,
          is_verified: true,
          total_sales: 0,
          positive_reviews: 0,
          negative_reviews: 0,
        });
      }

      const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", listingData.user_id)
        .eq("status", "active");

      setOtherListingsCount(count || 0);

      const { data: similarData } = await supabase
        .from("listings")
        .select("*")
        .neq("id", listingData.id)
        .eq("server", listingData.server)
        .eq("status", "active")
        .limit(3);

      if (similarData) {
        setSimilarListings(similarData);
      }

      setLoading(false);
    }

    if (id) loadPage();
  }, [id]);

  useEffect(() => {
    if (!listing?.expires_at) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(listing.expires_at!).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [listing?.expires_at]);

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

  function copyListingNo() {
    if (!listing) return;
    const shortNo = listing.id.slice(0, 8).toUpperCase();
    navigator.clipboard.writeText(shortNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(date: string | null) {
    if (!date) return "Belirtilmedi";
    return new Date(date).toLocaleDateString("tr-TR");
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) {
      alert("Mesaj göndermek için giriş yapmalısınız.");
      window.location.href = "/login";
      return;
    }

    if (!messageContent.trim() || !listing) return;

    setSendingMessage(true);
    setMessageStatus("");

    const { error } = await supabase.from("messages").insert([
      {
        listing_id: listing.id,
        sender_id: currentUserId,
        receiver_id: listing.user_id,
        content: messageContent.trim(),
      },
    ]);

    if (error) {
      setMessageStatus("Hata: " + error.message);
    } else {
      setMessageStatus("Mesajınız başarıyla iletildi!");
      setMessageContent("");
      setTimeout(() => {
        setIsMessageModalOpen(false);
        setMessageStatus("");
      }, 1500);
    }
    setSendingMessage(false);
  }

  async function handleDelete() {
    if (!listing || !currentUserId) return;

    if (listing.status === "sold") {
      setDeleteMessage(
        "Satilan ilanlar fiyat gecmisi icin arsivde tutulur ve silinemez."
      );
      return;
    }

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
      <main className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <p className="text-slate-300">Ilan yukleniyor...</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-transparent text-white flex items-center justify-center">
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

  const pos = seller?.positive_reviews || 0;
  const neg = seller?.negative_reviews || 0;
  const totalReviews = pos + neg;
  const successRate =
    totalReviews > 0 ? Math.round((pos / totalReviews) * 100) : 100;

  const sellerName = seller?.email ? seller.email.split("@")[0] : "Satıcı";
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const listingNo = listing.id.slice(0, 8).toUpperCase();

  return (
    <main className="min-h-screen bg-transparent text-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-yellow-400 font-bold mb-6 inline-block">
          ← Ana sayfaya don
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              {listing.image_url ? (
                <div
                  className="relative cursor-pointer overflow-hidden group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="w-full max-h-[420px] object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-black/70 text-white font-bold px-4 py-2 rounded-xl text-sm border border-yellow-400/50">
                      🔍 Tam Boyut Görmek İçin Tıkla
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-7xl bg-slate-800">
                  {categoryIcon(listing.category)}
                </div>
              )}

              <div className="p-8">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
                  <div className="text-sm text-yellow-400 font-bold">
                    {listing.category}
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400">İlan No:</span>
                    <span className="font-mono font-bold text-white">
                      #{listingNo}
                    </span>
                    <button
                      onClick={copyListingNo}
                      className="ml-1 text-yellow-400 hover:text-yellow-300 font-bold"
                      title="Kopyala"
                    >
                      {copied ? "✓ Kopyalandı" : "📋"}
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl font-extrabold mt-1">{listing.title}</h1>

                <p className="text-slate-400 mt-2">Sunucu: {listing.server}</p>

                <p className="text-emerald-400 text-4xl font-extrabold mt-6">
                  {Number(listing.price).toLocaleString("tr-TR")} TL
                </p>

                {timeLeft && (
                  <div className="mt-6 bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 mb-2 font-semibold">
                      ⏳ Kalan İlan Süresi:
                    </p>
                    <div className="flex items-center gap-3 text-center">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[60px]">
                        <span className="block text-lg font-black text-yellow-400">
                          {timeLeft.days}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          Gün
                        </span>
                      </div>
                      <span className="text-slate-600 font-bold">:</span>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[60px]">
                        <span className="block text-lg font-black text-yellow-400">
                          {timeLeft.hours}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          Saat
                        </span>
                      </div>
                      <span className="text-slate-600 font-bold">:</span>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[60px]">
                        <span className="block text-lg font-black text-yellow-400">
                          {timeLeft.minutes}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          Dakika
                        </span>
                      </div>
                      <span className="text-slate-600 font-bold">:</span>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[60px]">
                        <span className="block text-lg font-black text-emerald-400">
                          {timeLeft.seconds}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          Saniye
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 grid md:grid-cols-3 gap-4">
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
                    <p className="font-bold mt-1">
                      {formatDate(listing.expires_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-400 font-semibold mr-1">
                    İlanı Paylaş:
                  </span>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `${listing.title} - ${currentUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      currentUrl
                    )}&text=${encodeURIComponent(listing.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-sky-500 hover:bg-sky-400 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    Telegram
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      listing.title
                    )}&url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border border-slate-700"
                  >
                    Twitter (X)
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      currentUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    Facebook
                  </a>
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
                          Object.entries(details.alchemy).map(
                            ([stone, purity]) => (
                              <div
                                key={stone}
                                className="bg-slate-800 rounded-2xl p-4 border border-slate-700"
                              >
                                <p className="text-yellow-400 font-bold">
                                  {stone}
                                </p>
                                <p className="text-slate-200 mt-1">{purity}</p>

                                {details.alchemyBonuses?.[stone] &&
                                  details.alchemyBonuses[stone].length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {details.alchemyBonuses[stone].map(
                                        (bonus) => (
                                          <p
                                            key={bonus}
                                            className="text-xs text-slate-400 leading-5"
                                          >
                                            - {bonus}
                                          </p>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            )
                          )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4">
                        Nesne Market Ek Urunler
                      </h3>

                      {details.marketExtras &&
                      details.marketExtras.length > 0 ? (
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
                  <PurchaseButton
                    listingId={listing.id}
                    sellerId={listing.user_id}
                    listingStatus={listing.status}
                  />
                </div>

                {isOwner && (
                  <div className="mt-8 border-t border-slate-800 pt-6">
                    <h2 className="text-xl font-bold mb-4">Ilan Yonetimi</h2>

                    {listing.status === "sold" ? (
                      <p className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-slate-300">
                        Bu ilan satildi arsivinde. Fiyat gecmisinin korunmasi
                        icin duzenleme ve silme kapatildi.
                      </p>
                    ) : (
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
                    )}

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

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 text-black flex items-center justify-center text-2xl font-black shadow-lg">
                  {sellerName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-white">
                      {sellerName}
                    </h3>
                    {seller?.is_verified && (
                      <span
                        className="text-sky-400 text-lg"
                        title="Onaylı Satıcı"
                      >
                        ☑
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Üyenin Diğer Ürünleri ({otherListingsCount})
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">Başarı Oranı</span>
                  <span className="text-emerald-400">%{successRate}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${successRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 mb-5 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Toplam Satış Adedi:</span>
                  <span className="font-bold text-white">
                    {seller?.total_sales || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span>👍</span>
                    <span>({seller?.positive_reviews || 0})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                    <span>👎</span>
                    <span>({seller?.negative_reviews || 0})</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/50 mb-5 text-center">
                <p className="text-xs text-slate-400 mb-1">Son Görülme:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    Online
                  </span>
                </div>
              </div>

              {/* MESAJ VE WHATSAPP BUTONLARI */}
              {!isOwner && listing.status !== "sold" && (
                <div className="space-y-3">
                  <button
                    onClick={() => setIsMessageModalOpen(true)}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-yellow-400/10"
                  >
                    💬 Site İçi Mesaj Gönder
                  </button>

                  {listing.seller_phone && (
                    <a
                      href={createWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <span>📱</span> WhatsApp İle Ulaş
                    </a>
                  )}
                </div>
              )}
            </div>

            {similarListings.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-lg font-extrabold text-yellow-400 mb-4 flex items-center gap-2">
                  <span>🔥</span> Benzer İlanlar
                </h3>

                <div className="space-y-3">
                  {similarListings.map((sim) => (
                    <a
                      key={sim.id}
                      href={`/ilan/${sim.id}`}
                      className="block bg-slate-950 border border-slate-800 hover:border-yellow-400/50 rounded-2xl p-3 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {sim.image_url ? (
                          <img
                            src={sim.image_url}
                            alt={sim.title}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-yellow-400">
                            {categoryIcon(sim.category)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-yellow-400 transition-colors">
                            {sim.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {sim.server}
                          </p>
                          <p className="text-xs font-extrabold text-emerald-400 mt-1">
                            {Number(sim.price).toLocaleString("tr-TR")} TL
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MESAJ GÖNDERME MODAL PENCERESİ */}
      {isMessageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsMessageModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-yellow-400">
                Satıcıya Mesaj Gönder ({sellerName})
              </h3>
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-semibold">
                  İlan: {listing.title}
                </label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Mesajınızı buraya yazın..."
                  rows={4}
                  required
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/80"
                ></textarea>
              </div>

              {messageStatus && (
                <p className="text-sm p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
                  {messageStatus}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-bold transition-colors disabled:opacity-50"
                >
                  {sendingMessage ? "Gönderiliyor..." : "Mesaj Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GÖRSELİ TAM BOYUTTA BÜYÜTEN MODAL */}
      {isImageModalOpen && listing.image_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-pointer"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 rounded-xl bg-red-500/80 hover:bg-red-600 px-4 py-2 font-bold text-white transition-colors"
            >
              ✕ Kapat
            </button>
            <img
              src={listing.image_url}
              alt={listing.title}
              className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl border border-slate-800"
            />
          </div>
        </div>
      )}
    </main>
  );
}