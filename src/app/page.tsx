"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
  title: string;
  category: string;
  server: string;
  price: number;
  image_url: string | null;
  description: string | null;
  character_details: CharacterDetails | null;
  created_at: string;
};

type WonRate = {
  id: string;
  server: string;
  buy_price: number;
  sell_price: number;
  whatsapp: string;
  updated_at: string;
};

const adminWhatsApp = "905076680724";

const servers = [
  "Tumu",
  "Marmara",
  "Ezel",
  "Bagjanamu",
  "Lucifer",
  "Charon",
  "Safir",
  "Star",
  "Arkadaslar",
];

const realServers = [
  "Marmara",
  "Ezel",
  "Bagjanamu",
  "Lucifer",
  "Charon",
  "Safir",
  "Star",
  "Arkadaslar",
];

const categories = [
  "Tumu",
  "Karakter",
  "Yang",
  "Won Al",
  "Won Sat",
  "Esya",
  "EP",
  "Hesap",
  "Oyuncu Koltugu",
  "Oyuncu Bilgisayari",
  "Monitor",
  "Ekran Karti",
  "Klavye",
  "Mouse",
  "Kulaklik",
];

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [wonRates, setWonRates] = useState<WonRate[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedServer, setSelectedServer] = useState("Tumu");
  const [selectedCategory, setSelectedCategory] = useState("Tumu");

  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [assistantListings, setAssistantListings] = useState<Listing[]>([]);
  const [assistantWonRates, setAssistantWonRates] = useState<WonRate[]>([]);
  const [showAssistantResult, setShowAssistantResult] = useState(false);
  const [showAdminContact, setShowAdminContact] = useState(false);

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
        console.log("Ilanlar cekilirken hata:", error.message);
        setLoading(false);
        return;
      }

      setListings(data || []);
      setLoading(false);
    }

    async function getWonRates() {
      const { data, error } = await supabase
        .from("won_rates")
        .select("*")
        .order("server", { ascending: true });

      if (error) {
        console.log("Won fiyatlari alinamadi:", error.message);
        return;
      }

      setWonRates(data || []);
    }

    getUser();
    getListings();
    getWonRates();

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

  function normalizeText(text: string | null | undefined) {
    return String(text || "")
      .toLowerCase()
      .replace(/\u0131/g, "i")
      .replace(/\u0130/g, "i")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function categoryIcon(category: string) {
    if (normalizeText(category) === "karakter") return "K";
    if (normalizeText(category) === "yang") return "Y";
    if (normalizeText(category) === "won al") return "WA";
    if (normalizeText(category) === "won sat") return "WS";
    if (normalizeText(category) === "esya") return "E";
    if (normalizeText(category) === "ep") return "EP";
    if (normalizeText(category) === "hesap") return "H";
    return "O";
  }

  function listingSearchText(item: Listing) {
    return normalizeText(
      [
        item.title,
        item.category,
        item.server,
        item.description,
        JSON.stringify(item.character_details || {}),
      ].join(" ")
    );
  }

  function detectServer(query: string) {
    return realServers.find((server) =>
      query.includes(normalizeText(server))
    );
  }

  function detectWonIntent(query: string) {
    const hasWon = query.includes("won");

    if (!hasWon) return null;

    const wantsToSell =
      query.includes("satmak") ||
      query.includes("satacam") ||
      query.includes("satacagim") ||
      query.includes("saticam") ||
      query.includes("satayim") ||
      query.includes("siteye sat") ||
      query.includes("won satmak");

    const wantsToBuy =
      query.includes("almak") ||
      query.includes("alicam") ||
      query.includes("alacagim") ||
      query.includes("lazim") ||
      query.includes("ariyorum") ||
      query.includes("satilik") ||
      query.includes("won almak");

    if (wantsToSell) return "sell_to_site";
    if (wantsToBuy) return "buy_from_site";

    return "won_general";
  }

  function detectCharacterSearch(query: string) {
    const characterWords = [
      "sura",
      "savasci",
      "saman",
      "ninja",
      "lycan",
      "kurt",
      "bedensel",
      "zihinsel",
      "keskinlik",
      "buyulu",
      "karabuyu",
      "okcu",
      "bicakci",
      "sifaci",
      "kritikci",
      "ejderha",
    ];

    return characterWords.some((word) => query.includes(word));
  }

  function runSmartAssistant() {
    const query = normalizeText(assistantInput);

    if (!query) {
      setAssistantMessage("Ne aradigini yazarsan site icinde kontrol edebilirim.");
      setAssistantListings([]);
      setAssistantWonRates([]);
      setShowAssistantResult(true);
      setShowAdminContact(false);
      return;
    }

    const server = detectServer(query);
    const wonIntent = detectWonIntent(query);
    const isCharacterSearch = detectCharacterSearch(query);

    let officialWonResults: WonRate[] = [];
    let foundListings: Listing[] = [];

    if (wonIntent) {
      officialWonResults = wonRates.filter((rate) => {
        if (!server) return true;
        return normalizeText(rate.server) === normalizeText(server);
      });

      foundListings = listings.filter((item) => {
        const itemServer = normalizeText(item.server);
        const itemCategory = normalizeText(item.category);

        if (server && itemServer !== normalizeText(server)) {
          return false;
        }

        if (wonIntent === "buy_from_site") {
          return itemCategory === "won sat";
        }

        if (wonIntent === "sell_to_site") {
          return itemCategory === "won al";
        }

        return itemCategory === "won sat" || itemCategory === "won al";
      });
    } else if (isCharacterSearch) {
      foundListings = listings.filter((item) => {
        const text = listingSearchText(item);
        const itemServer = normalizeText(item.server);
        const itemCategory = normalizeText(item.category);

        if (server && itemServer !== normalizeText(server)) {
          return false;
        }

        if (!(itemCategory === "karakter" || itemCategory === "hesap")) {
          return false;
        }

        const importantWords = [
          "sura",
          "savasci",
          "saman",
          "ninja",
          "lycan",
          "kurt",
          "bedensel",
          "zihinsel",
          "keskinlik",
          "buyulu",
          "karabuyu",
          "okcu",
          "bicakci",
          "sifaci",
          "kritikci",
          "ejderha",
          "kusursuz",
          "mukemmel",
          "yakut",
          "elmas",
          "yesim",
          "safir",
          "oniks",
          "ametist",
          "grena",
        ];

        const requestedWords = importantWords.filter((word) =>
          query.includes(word)
        );

        if (requestedWords.length === 0) {
          return true;
        }

        return requestedWords.every((word) => text.includes(word));
      });
    } else {
      const stopWords = [
        "istiyorum",
        "ariyorum",
        "lazim",
        "var",
        "mi",
        "icin",
        "bana",
        "bir",
        "adet",
        "site",
        "sitede",
        "goster",
      ];

      const words = query
        .split(" ")
        .filter((word) => word.length > 2 && !stopWords.includes(word));

      foundListings = listings.filter((item) => {
        const text = listingSearchText(item);
        return words.some((word) => text.includes(word));
      });
    }

    setAssistantListings(foundListings.slice(0, 12));
    setAssistantWonRates(officialWonResults);
    setShowAssistantResult(true);

    const hasAnyResult =
      foundListings.length > 0 || officialWonResults.length > 0;

    setShowAdminContact(!hasAnyResult);

    if (wonIntent === "buy_from_site") {
      setAssistantMessage(
        server
          ? `${server} icin won alma talebini kontrol ettim. Resmi fiyat ve kullanici ilanlari asagida.`
          : "Won alma talebini kontrol ettim. Resmi fiyatlar ve kullanici ilanlari asagida."
      );
      return;
    }

    if (wonIntent === "sell_to_site") {
      setAssistantMessage(
        server
          ? `${server} icin won satma talebini kontrol ettim. Resmi alis fiyati ve kullanici ilanlari asagida.`
          : "Won satma talebini kontrol ettim. Resmi alis fiyatlari ve kullanici ilanlari asagida."
      );
      return;
    }

    if (isCharacterSearch) {
      setAssistantMessage(
        hasAnyResult
          ? "Karakter / hesap ilanlari icinde arama yaptim. Uygun sonuclari asagida listeledim."
          : "Su an bu aramaya uygun karakter veya hesap ilani yok. Talebini adminlere iletebilirsin."
      );
      return;
    }

    setAssistantMessage(
      hasAnyResult
        ? "Site icinde uygun ilanlari buldum. Sonuclari asagida listeledim."
        : "Bu aramaya uygun ilan bulamadim. Talebini adminlere iletebilirim."
    );
  }

  function clearAssistant() {
    setAssistantInput("");
    setAssistantMessage("");
    setAssistantListings([]);
    setAssistantWonRates([]);
    setShowAssistantResult(false);
    setShowAdminContact(false);
  }

  function createAdminWhatsAppLink() {
    const message = `Merhaba, Metin2AlSat sitesinde sunu ariyorum: ${assistantInput}`;
    return `https://api.whatsapp.com/send?phone=${adminWhatsApp}&text=${encodeURIComponent(
      message
    )}`;
  }

  function createWonWhatsAppLink(rate: WonRate, type: "buy" | "sell") {
    const phone = rate.whatsapp || adminWhatsApp;

    const message =
      type === "buy"
        ? `Merhaba, ${rate.server} sunucusunda won almak istiyorum. Sitede satis fiyati ${rate.sell_price} TL gorunuyor.`
        : `Merhaba, ${rate.server} sunucusunda won satmak istiyorum. Sitede alis fiyati ${rate.buy_price} TL gorunuyor.`;

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
      message
    )}`;
  }

  const filteredListings = listings.filter((item) => {
    const itemServer = normalizeText(item.server);
    const itemCategory = normalizeText(item.category);

    const serverMatch =
      selectedServer === "Tumu" || itemServer === normalizeText(selectedServer);

    const categoryMatch =
      selectedCategory === "Tumu" ||
      itemCategory === normalizeText(selectedCategory);

    return serverMatch && categoryMatch;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <button
          onClick={() => (window.location.href = "/")}
          className="text-3xl font-bold text-yellow-400"
        >
          Metin2AlSat
        </button>

        <div className="flex items-center gap-3">
          <a
            href="/won"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold"
          >
            Resmi Won Al / Sat
          </a>

          <a
            href="/ticaret-nasil-yapilir"
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl font-bold"
          >
            Ticaret Nasil Yapilir?
          </a>

          {userEmail ? (
            <>
              <span className="text-sm text-slate-300">{userEmail}</span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-bold"
              >
                Cikis Yap
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => (window.location.href = "/login")}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2 rounded-xl font-bold"
              >
                Giris Yap
              </button>

              <button
                onClick={() => (window.location.href = "/register")}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl font-bold"
              >
                Kayit Ol
              </button>
            </>
          )}

          <button
            onClick={() => (window.location.href = "/ilan-ver")}
            className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-xl font-bold"
          >
            Ilan Ver
          </button>
        </div>
      </header>

      <section className="px-8 py-16 text-center">
        <h1 className="text-5xl font-extrabold mb-4">
          Metin2 Alim Satim Pazari
        </h1>

        <p className="text-slate-300 mb-8">
          Ne aradigini yaz. Asistan site icindeki ilanlari ve resmi won fiyatlarini kontrol etsin.
        </p>

        <div className="mx-auto max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-5">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSmartAssistant();
              }}
              className="flex-1 rounded-2xl px-5 py-4 bg-white text-black placeholder:text-gray-500"
              placeholder="Ornek: Charon won almak istiyorum, Lucifer keskinlik sura ariyorum..."
            />

            <button
              onClick={runSmartAssistant}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-4 rounded-2xl font-bold"
            >
              Asistan Ara
            </button>

            {showAssistantResult && (
              <button
                onClick={clearAssistant}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl font-bold"
              >
                Temizle
              </button>
            )}
          </div>

          {showAssistantResult && (
            <div className="mt-5 text-left">
              <p className="text-slate-300">{assistantMessage}</p>

              {assistantWonRates.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4 mt-5">
                  {assistantWonRates.map((rate) => (
                    <div
                      key={rate.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-5"
                    >
                      <h3 className="text-2xl font-bold text-yellow-400">
                        Resmi {rate.server} Won
                      </h3>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-slate-800 rounded-xl p-4">
                          <p className="text-slate-400 text-sm">Bizim Alis</p>
                          <p className="text-red-400 text-2xl font-bold">
                            {Number(rate.buy_price).toLocaleString("tr-TR")} TL
                          </p>
                        </div>

                        <div className="bg-slate-800 rounded-xl p-4">
                          <p className="text-slate-400 text-sm">Bizim Satis</p>
                          <p className="text-emerald-400 text-2xl font-bold">
                            {Number(rate.sell_price).toLocaleString("tr-TR")} TL
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 mt-4">
                        <a
                          href={createWonWhatsAppLink(rate, "buy")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold text-center"
                        >
                          Won Al
                        </a>

                        <a
                          href={createWonWhatsAppLink(rate, "sell")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-3 rounded-xl font-bold text-center"
                        >
                          Won Sat
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {assistantListings.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4 mt-5">
                  {assistantListings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="h-40 flex items-center justify-center text-4xl bg-slate-800">
                          {categoryIcon(item.category)}
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-yellow-400 text-sm font-bold">
                            {item.category}
                          </p>
                          <p className="text-xs bg-slate-800 px-3 py-1 rounded-full">
                            {item.server}
                          </p>
                        </div>

                        <h3 className="text-lg font-bold mt-3">
                          {item.title}
                        </h3>

                        <p className="text-emerald-400 text-xl font-bold mt-3">
                          {Number(item.price).toLocaleString("tr-TR")} TL
                        </p>

                        <button
                          onClick={() =>
                            (window.location.href = `/ilan/${item.id}`)
                          }
                          className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold"
                        >
                          Ilani Incele
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAdminContact && (
                <div className="mt-5 bg-slate-950 border border-slate-800 rounded-2xl p-5">
                  <p className="text-slate-300 mb-4">
                    Uygun sonuc bulamadim. Talebini adminlere iletebilirim.
                  </p>

                  <a
                    href={createAdminWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-bold"
                  >
                    Adminlere WhatsApp ile Ilet
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="px-8 mb-8">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">
          1. Sunucu Sec
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
          2. Kategori Sec
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
              {cat === "Tumu" ? "Tumu" : `${categoryIcon(cat)} ${cat}`}
            </button>
          ))}
        </div>
      </section>

      <section className="px-8 pb-16">
        <h2 className="text-2xl font-bold mb-6">
          Son Eklenen Ilanlar
        </h2>

        {loading && <p className="text-slate-400">Ilanlar yukleniyor...</p>}

        {!loading && filteredListings.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-300 mb-4">
              Bu filtreye uygun ilan bulunamadi.
            </p>

            <button
              onClick={() => (window.location.href = "/ilan-ver")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
            >
              Ilk Ilani Sen Ver
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
                  Ilani Incele
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 text-center text-slate-400 py-8">
        2026 Metin2AlSat.com
      </footer>
    </main>
  );
}