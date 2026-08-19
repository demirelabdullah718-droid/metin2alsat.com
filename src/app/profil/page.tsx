"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Listing = {
  id: string;
  title: string;
  price: number;
  server: string;
  category: string;
  status: string;
  image_url: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  email?: string;
  is_verified?: boolean;
  total_sales?: number;
  positive_reviews?: number;
  negative_reviews?: number;
  created_at?: string;
  phone?: string;
  is_approved?: boolean;
};

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Telefon güncelleme state'leri
  const [phoneInput, setPhoneInput] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    // Profil Bilgilerini Çek
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile({
      id: user.id,
      email: user.email,
      is_verified: profileData?.is_verified || false,
      total_sales: profileData?.total_sales || 0,
      positive_reviews: profileData?.positive_reviews || 0,
      negative_reviews: profileData?.negative_reviews || 0,
      created_at: user.created_at,
      phone: profileData?.phone || "",
      is_approved: profileData?.is_approved || false,
    });

    if (profileData?.phone) {
      setPhoneInput(profileData.phone);
    }

    // Kullanıcının İlanlarını Çek
    const { data: listingsData } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (listingsData) {
      setUserListings(listingsData);
    }

    setLoading(false);
  }

  // Telefon Kaydetme / Güncelleme ve Tekil Kontrolü
  async function handleSavePhone(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    if (!phoneInput.trim()) {
      alert("Lütfen geçerli bir telefon numarası girin!");
      return;
    }

    setSavingPhone(true);
    setPhoneMsg("");

    // 1. Bu numara başka bir kullanıcıda kayıtlı mı kontrol et
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", phoneInput.trim())
      .maybeSingle();

    if (existingUser && existingUser.id !== profile.id) {
      alert("Bu cep telefonu numarası başka bir hesapta zaten kayıtlı!");
      setSavingPhone(false);
      return;
    }

    // 2. Numarayı kaydet ve onay durumunu false yap (Yönetici tekrar onaylasın)
    const { error } = await supabase
      .from("profiles")
      .update({
        phone: phoneInput.trim(),
        is_approved: false, 
      })
      .eq("id", profile.id);

    setSavingPhone(false);

    if (error) {
      alert("Telefon kaydedilirken hata oluştu: " + error.message);
    } else {
      setPhoneMsg("Telefon numaranız kaydedildi. Yönetici onayından sonra ilan verebilirsiniz.");
      setProfile((prev) => (prev ? { ...prev, phone: phoneInput.trim(), is_approved: false } : null));
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <p className="text-slate-300">Profil yükleniyor...</p>
      </main>
    );
  }

  const pos = profile?.positive_reviews || 0;
  const neg = profile?.negative_reviews || 0;
  const totalReviews = pos + neg;
  const successRate = totalReviews > 0 ? Math.round((pos / totalReviews) * 100) : 100;

  return (
    <main className="min-h-screen bg-transparent text-white px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <a href="/" className="text-yellow-400 font-bold inline-block">
          ← Ana Sayfaya Dön
        </a>

        {/* PROFİL ÖZET KARTI */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-yellow-500 to-amber-300 text-black flex items-center justify-center text-3xl font-black shadow-lg">
                {profile?.email ? profile.email.charAt(0).toUpperCase() : "U"}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white">
                    {profile?.email}
                  </h1>
                  {profile?.is_verified && (
                    <span className="text-sky-400 text-xl" title="Onaylı Satıcı">
                      ☑
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Kayıt Tarihi: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                </p>
                
                {/* Onay Durumu Rozeti */}
                <div className="mt-2">
                  {profile?.is_approved ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                      ✓ Hesap Onaylı (İlan Verebilir)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-full font-bold">
                      ⏳ Yönetici Onayı Bekleniyor
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* İSTATİSTİKLER */}
            <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <div className="text-center px-3">
                <p className="text-xs text-slate-400">Toplam Satış</p>
                <p className="text-lg font-black text-white mt-0.5">{profile?.total_sales || 0}</p>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="text-center px-3">
                <p className="text-xs text-slate-400">Başarı</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">%{successRate}</p>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="text-center px-3 flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-sm">👍 {pos}</span>
                <span className="text-rose-500 font-bold text-sm">👎 {neg}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TELEFON BİLGİSİ VE GÜNCELLEME ALANI */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">📱 İletişim / Cep Telefonu</h3>
          <p className="text-xs text-slate-400 mb-4">
            Al-sat yapabilmek ve ilan ekleyebilmek için telefon numaranızı kaydetmeniz zorunludur. Her numara sadece bir hesapta kullanılabilir.
          </p>

          <form onSubmit={handleSavePhone} className="flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              placeholder="0500 000 00 00"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
              required
            />
            <button
              type="submit"
              disabled={savingPhone}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-xl text-sm transition"
            >
              {savingPhone ? "Kaydediliyor..." : "Telefonu Kaydet"}
            </button>
          </form>

          {phoneMsg && <p className="text-xs text-emerald-400 mt-3 font-medium">{phoneMsg}</p>}
        </div>

        {/* KULLANICININ İLANLARI */}
        <div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">
            📦 Verdiğin İlanlar ({userListings.length})
          </h2>

          {userListings.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
              <p className="text-slate-400 mb-4">Henüz aktif bir ilan vermedin.</p>
              {profile?.is_approved ? (
                <a
                  href="/ilan-ver"
                  className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  Hemen İlan Ver
                </a>
              ) : (
                <p className="text-xs text-rose-400 font-bold">
                  İlan verebilmek için telefonunuzu kaydetmeniz ve yönetici onayı almanız gerekmektedir.
                </p>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {userListings.map((ilan) => (
                <div
                  key={ilan.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {ilan.image_url ? (
                      <img
                        src={ilan.image_url}
                        alt={ilan.title}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-yellow-400">
                        {ilan.category.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-1">{ilan.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ilan.server} • {ilan.category}</p>
                      <p className="text-sm font-extrabold text-emerald-400 mt-1">
                        {Number(ilan.price).toLocaleString("tr-TR")} TL
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        ilan.status === "sold"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {ilan.status === "sold" ? "Satıldı" : "Aktif"}
                    </span>
                    <a
                      href={`/ilan/${ilan.id}`}
                      className="text-xs text-yellow-400 hover:underline font-semibold"
                    >
                      Görüntüle →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}