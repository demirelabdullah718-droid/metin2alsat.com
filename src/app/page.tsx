"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Listing = {
  id: string;
  title: string;
  category: string;
  server: string;
  price: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
};

const servers = [
  "Tümü",
  "Marmara",
  "Ezel",
  "Bagjanamu",
  "Lucifer",
  "Charon",
  "Safir",
  "Star",
  "Arkadaşlar",
];

const categories = [
  "Tümü",
  "Karakter",
  "Yang",
  "Won Al",
  "Won Sat",
  "Eşya",
  "EP",
  "Hesap",
];

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedServer, setSelectedServer] = useState("Tümü");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user.email) {
        setUserEmail(data.session.user.email);
        localStorage.setItem("metin2alsat_user_email", data.session.user.email);
        return;
      }

      const savedEmail = localStorage.getItem("metin2alsat_user_email");
      setUserEmail(savedEmail);
    }

    async function getListings() {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("İlanlar çekilirken hata:", error.message);
        setLoading(false);
        return;
      }

      setListings(data || []);
      setLoading(false);
    }

    getUser();
    getListings();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user.email) {
          setUserEmail(session.user.email);
          localStorage.setItem("metin2alsat_user_email", session.user.email);
        } else {
          setUserEmail(null);
          localStorage.removeItem("metin2alsat_user_email");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("metin2alsat_user_email");
    setUserEmail(null);
  }

  function categoryIcon(category: string) {
    if (category === "Karakter") return "🛡️";
    if (category === "Yang") return "💰";
    if (category === "Won Al") return "🛒";
    if (category === "Won Sat") return "💎";
    if (category === "Eşya") return "⚔️";
    if (category === "EP") return "⚡";
    if (category === "Hesap") return "📦";
    return "🎮";
  }

  const filteredListings = listings.filter((item) => {
    const serverMatch =
      selectedServer === "Tümü" || item.server === selectedServer;

    const categoryMatch =
      selectedCategory === "Tümü" || item.category === selectedCategory;

    return serverMatch && categoryMatch;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <button
          onClick={() => (window.location.href = "/")}
          className="text-3xl font-bold text-yellow-400"
        >
          🎮 Metin2AlSat
        </button>

        <div className="flex items-center gap-3">
          <a
            href="/ticaret-nasil-yapilir"
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl font-bold"
          >
            Ticaret Nasıl Yapılır?
          </a>

          {userEmail ? (
            <>
              <span className="text-sm text-slate-300">{userEmail}</span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-bold"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => (window.location.href = "/login")}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2 rounded-xl font-bold"
              >
                Giriş Yap
              </button>

              <button
                onClick={() => (window.location.href = "/register")}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl font-bold"
              >
                Kayıt Ol
              </button>
            </>
          )}

          <button
            onClick={() => (window.location.href = "/ilan-ver")}
            className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-xl font-bold"
          >
            İlan Ver
          </button>
        </div>
      </header>

      <section className="px-8 py-16 text-center">
        <h1 className="text-5xl font-extrabold mb-4">
          Metin2 Alım Satım Pazarı
        </h1>

        <p className="text-slate-300 mb-8">
          Sunucunu seç, kategorini seç, güvenli şekilde satıcıyla iletişime geç.
        </p>

        <input
          className="w-full max-w-3xl rounded-2xl px-5 py-4 bg-white text-black placeholder:text-gray-500"
          placeholder="İlan ara: karakter, won, eşya..."
        />
      </section>

      <section className="px-8 mb-8">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">
          1. Sunucu Seç
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {servers.map((serverName) => (
            <button
              key={serverName}
              onClick={() => setSelectedServer(serverName)}
              className={`rounded-2xl p-4 font-bold border ${
                selectedServer === serverName
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-slate-900 border-slate-800 hover:border-yellow-400"
              }`}
            >
              {serverName}
            </button>
          ))}
        </div>
      </section>

      <section className="px-8 mb-12">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">
          2. Kategori Seç
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-2xl p-5 text-center font-bold border ${
                selectedCategory === cat
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-slate-900 border-slate-800 hover:border-yellow-400"
              }`}
            >
              {cat === "Tümü" ? "🎮 Tümü" : `${categoryIcon(cat)} ${cat}`}
            </button>
          ))}
        </div>
      </section>

      <section className="px-8 pb-16">
        <h2 className="text-2xl font-bold mb-6">
          🔥 Son Eklenen İlanlar
        </h2>

        {loading && <p className="text-slate-400">İlanlar yükleniyor...</p>}

        {!loading && filteredListings.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-300 mb-4">
              Bu filtreye uygun ilan bulunamadı.
            </p>

            <button
              onClick={() => (window.location.href = "/ilan-ver")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
            >
              İlk İlanı Sen Ver
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-52 object-cover"
                />
              ) : (
                <div className="h-52 flex items-center justify-center text-6xl bg-slate-800">
                  {categoryIcon(item.category)}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-yellow-400 font-bold">
                    {item.category}
                  </div>

                  <div className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                    {item.server}
                  </div>
                </div>

                <h3 className="text-xl font-bold mt-3">{item.title}</h3>

                {item.description && (
                  <p className="text-slate-400 mt-3 text-sm line-clamp-2">
                    {item.description}
                  </p>
                )}

                <p className="text-emerald-400 text-2xl font-extrabold mt-4">
                  {Number(item.price).toLocaleString("tr-TR")} TL
                </p>

                <button
                  onClick={() => (window.location.href = `/ilan/${item.id}`)}
                  className="w-full mt-5 bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold"
                >
                  İlanı İncele
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 text-center text-slate-400 py-8">
        © 2026 Metin2AlSat.com
      </footer>
    </main>
  );
}