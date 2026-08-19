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
};

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      });

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

    loadUserData();
  }, []);

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

        {/* KULLANICININ İLANLARI */}
        <div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">
            📦 Verdiğin İlanlar ({userListings.length})
          </h2>

          {userListings.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
              <p className="text-slate-400 mb-4">Henüz aktif bir ilan vermedin.</p>
              <a
                href="/ilan-ver"
                className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                Hemen İlan Ver
              </a>
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