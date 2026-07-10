"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const servers = [
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

const characterClasses = ["Savasci", "Saman", "Sura", "Ninja", "Lycan / Kurt"];

const classBuilds: Record<string, string[]> = {
  Savasci: ["Bedensel", "Zihinsel"],
  Saman: ["Kritikci / Ejderha Gucu", "Sifaci / Iyilestirme"],
  Sura: ["Karabuyu", "Keskinlik / Buyulu Silah"],
  Ninja: ["Okcu", "Bicakci"],
  "Lycan / Kurt": ["Lycan / Kurt"],
};

const alchemyStones = [
  "Elmas",
  "Yesim",
  "Yakut",
  "Grena",
  "Ametist",
  "Safir",
  "Oniks",
];

const purityOptions = [
  "Yok",
  "Mat",
  "Parlak",
  "Tertemiz",
  "Mukemmel",
  "Kusursuz",
];

const alchemyBonusOptions: Record<string, string[]> = {
  Elmas: [
    "Beceri Hasari",
    "Beceri Hasarina Karsi Koyma",
    "Buyu Savunmasi",
    "Buyulu Saldiri Degeri",
  ],
  Yesim: [
    "Max HP",
    "Max Yuzde HP",
    "HP Uretimi",
    "Hasar HP ile absorbe edilecek",
    "HP Yenileme Sansi",
  ],
  Yakut: [
    "Ortalama Zarar",
    "Ortalama Zarara Direnis",
    "Saldiri Degeri",
    "Savunma",
  ],
  Grena: [
    "Max SP",
    "Max Yuzde SP",
    "SP Uretimi",
    "Hasar SP ile absorbe edilecek",
    "SP Yenileme Sansi",
  ],
  Ametist: [
    "SungMa Iradesi STR",
    "SungMa Iradesi RES",
    "SungMa Iradesi INT",
    "Metin Tasi Karsisinda Guclu",
  ],
  Safir: [
    "Savascilara Guclu",
    "Savascilara Karsi Savunma",
    "Ninjalara Karsi Guclu",
    "Ninjalara Karsi Savunma",
    "Suralara Karsi Guclu",
    "Suralara Karsi Savunma",
    "Lycanlara Karsi Guclu",
    "Lycanlara Karsi Savunma",
    "Samanlara Karsi Guclu",
    "Samanlara Karsi Savunma",
  ],
  Oniks: [
    "Bloklama",
    "Delici Vurus Sansi",
    "Kritik Vurus Sansi",
    "Oklardan Korunma",
    "Yansitma",
  ],
};

const marketExtras = [
  "3. El",
  "Otomatik Av",
  "Premium Pazar",
  "Depo Sandigi",
  "Kostum",
  "Pet",
  "Binek",
  "Saman Paketi",
  "Diger",
];

export default function IlanVerPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Karakter");
  const [server, setServer] = useState("Marmara");
  const [price, setPrice] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [listingDurationDays, setListingDurationDays] = useState("7");
  const [maxDeliveryHours, setMaxDeliveryHours] = useState("24");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [characterClass, setCharacterClass] = useState("Savasci");
  const [characterBuild, setCharacterBuild] = useState("Bedensel");
  const [biolog, setBiolog] = useState("");

  const [alchemy, setAlchemy] = useState<Record<string, string>>({
    Elmas: "Yok",
    Yesim: "Yok",
    Yakut: "Yok",
    Grena: "Yok",
    Ametist: "Yok",
    Safir: "Yok",
    Oniks: "Yok",
  });

  const [alchemyBonuses, setAlchemyBonuses] = useState<Record<string, string[]>>({
    Elmas: [],
    Yesim: [],
    Yakut: [],
    Grena: [],
    Ametist: [],
    Safir: [],
    Oniks: [],
  });

  const [selectedMarketExtras, setSelectedMarketExtras] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const showCharacterPanel = category === "Karakter" || category === "Hesap";

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession();

      if (!data.session?.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(data.session.user.id);
    }

    checkUser();
  }, []);

  function changeCharacterClass(newClass: string) {
    setCharacterClass(newClass);
    setCharacterBuild(classBuilds[newClass][0]);
  }

  function updateAlchemy(stone: string, value: string) {
    setAlchemy((prev) => ({
      ...prev,
      [stone]: value,
    }));
  }

  function toggleAlchemyBonus(stone: string, bonus: string) {
    setAlchemyBonuses((prev) => {
      const current = prev[stone] || [];

      if (current.includes(bonus)) {
        return {
          ...prev,
          [stone]: current.filter((item) => item !== bonus),
        };
      }

      return {
        ...prev,
        [stone]: [...current, bonus],
      };
    });
  }

  function toggleMarketExtra(extra: string) {
    setSelectedMarketExtras((prev) => {
      if (prev.includes(extra)) {
        return prev.filter((item) => item !== extra);
      }

      return [...prev, extra];
    });
  }

  async function compressImageFile(file: File): Promise<File> {
    const maxWidth = 1200;
    const maxHeight = 1200;
    const maxSizeBytes = 1024 * 1024;

    const imageUrl = URL.createObjectURL(file);

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image could not be loaded."));
      img.src = imageUrl;
    });

    let width = image.width;
    let height = image.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      URL.revokeObjectURL(imageUrl);
      return file;
    }

    ctx.drawImage(image, 0, 0, width, height);

    async function canvasToBlob(quality: number) {
      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Image could not be compressed."));
          },
          "image/jpeg",
          quality
        );
      });
    }

    let quality = 0.8;
    let blob = await canvasToBlob(quality);

    while (blob.size > maxSizeBytes && quality > 0.45) {
      quality = quality - 0.1;
      blob = await canvasToBlob(quality);
    }

    URL.revokeObjectURL(imageUrl);

    return new File([blob], "listing-image.jpg", {
      type: "image/jpeg",
    });
  }

  async function uploadImage() {
    if (!selectedImage || !userId) return null;

    const compressedImage = await compressImageFile(selectedImage);

    const fileName = `${Date.now()}.jpg`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(filePath, compressedImage, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!userId) {
      setMessage("Once giris yapmalisin.");
      return;
    }

    setMessage("Ilan kaydediliyor...");

    try {
      const durationDays = Number(listingDurationDays);
      const expiresAt = new Date(
        Date.now() + durationDays * 24 * 60 * 60 * 1000
      ).toISOString();

      const imageUrl = await uploadImage();

      const characterDetails = showCharacterPanel
        ? {
            class: characterClass,
            build: characterBuild,
            biolog,
            alchemy,
            alchemyBonuses,
            marketExtras: selectedMarketExtras,
          }
        : {};

      const { error } = await supabase.from("listings").insert({
        user_id: userId,
        title,
        category,
        server,
        price: Number(price),
        seller_phone: sellerPhone.replace(/\D/g, ""),
        listing_duration_days: durationDays,
        max_delivery_hours: Number(maxDeliveryHours),
        expires_at: expiresAt,
        image_url: imageUrl,
        description,
        character_details: characterDetails,
        status: "active",
      });

      if (error) {
        setMessage("Hata: " + error.message);
        return;
      }

      setMessage("Ilan basariyla eklendi!");

      setTitle("");
      setCategory("Karakter");
      setServer("Marmara");
      setPrice("");
      setSellerPhone("");
      setListingDurationDays("7");
      setMaxDeliveryHours("24");
      setDescription("");
      setSelectedImage(null);
      setCharacterClass("Savasci");
      setCharacterBuild("Bedensel");
      setBiolog("");
      setAlchemy({
        Elmas: "Yok",
        Yesim: "Yok",
        Yakut: "Yok",
        Grena: "Yok",
        Ametist: "Yok",
        Safir: "Yok",
        Oniks: "Yok",
      });
      setAlchemyBonuses({
        Elmas: [],
        Yesim: [],
        Yakut: [],
        Grena: [],
        Ametist: [],
        Safir: [],
        Oniks: [],
      });
      setSelectedMarketExtras([]);
    } catch (error: any) {
      setMessage("Hata: " + error.message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Ilan Ver</h1>
            <p className="text-slate-400 mt-2">
              Metin2 ve oyuncu urunleri icin ilan olustur.
            </p>
          </div>

          <a href="/" className="text-sm text-yellow-400 font-bold">
            Ana Sayfa
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm text-slate-300">Sunucu</label>
            <select
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
              required
            >
              {servers.map((serverName) => (
                <option key={serverName} value={serverName}>
                  {serverName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
              required
            >
              {categories.map((categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
            </select>
          </div>

          {showCharacterPanel && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  Karakter / Hesap Detaylari
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Sinif, build, biyolog, simya ve nesne market bilgilerini sec.
                </p>
              </div>

              <div>
                <label className="block mb-3 text-sm text-slate-300">
                  Karakter Sinifi
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {characterClasses.map((className) => (
                    <button
                      type="button"
                      key={className}
                      onClick={() => changeCharacterClass(className)}
                      className={`rounded-xl px-4 py-3 font-bold border ${
                        characterClass === className
                          ? "bg-yellow-400 text-black border-yellow-400"
                          : "bg-slate-900 border-slate-700 hover:border-yellow-400"
                      }`}
                    >
                      {className}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-3 text-sm text-slate-300">
                  Panel / Build
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {classBuilds[characterClass].map((buildName) => (
                    <button
                      type="button"
                      key={buildName}
                      onClick={() => setCharacterBuild(buildName)}
                      className={`rounded-xl px-4 py-3 font-bold border ${
                        characterBuild === buildName
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-slate-900 border-slate-700 hover:border-emerald-500"
                      }`}
                    >
                      {buildName}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Biyolog Durumu
                </label>
                <input
                  value={biolog}
                  onChange={(e) => setBiolog(e.target.value)}
                  placeholder="Ornek: 92 biyolog tamam, 94 devam ediyor..."
                  className="w-full rounded-xl px-4 py-3 bg-white text-black placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block mb-3 text-sm text-slate-300">
                  Simya Paneli
                </label>

                <div className="grid md:grid-cols-2 gap-4">
                  {alchemyStones.map((stone) => (
                    <div
                      key={stone}
                      className="bg-slate-900 rounded-xl p-4 border border-slate-800"
                    >
                      <label className="block mb-2 text-sm font-bold text-yellow-400">
                        {stone}
                      </label>

                      <select
                        value={alchemy[stone]}
                        onChange={(e) => updateAlchemy(stone, e.target.value)}
                        className="w-full rounded-xl px-4 py-3 bg-white text-black"
                      >
                        {purityOptions.map((purity) => (
                          <option key={purity} value={purity}>
                            {purity}
                          </option>
                        ))}
                      </select>

                      <div className="mt-4">
                        <p className="text-xs text-slate-400 mb-2">
                          Efsunlar
                        </p>

                        <div className="grid gap-2">
                          {alchemyBonusOptions[stone].map((bonus) => (
                            <button
                              type="button"
                              key={bonus}
                              onClick={() => toggleAlchemyBonus(stone, bonus)}
                              className={`text-left rounded-xl px-3 py-2 text-sm font-bold border ${
                                alchemyBonuses[stone]?.includes(bonus)
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "bg-slate-950 text-slate-300 border-slate-700 hover:border-blue-500"
                              }`}
                            >
                              {bonus}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-3 text-sm text-slate-300">
                  Nesne Market Ek Urunler
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {marketExtras.map((extra) => (
                    <button
                      type="button"
                      key={extra}
                      onClick={() => toggleMarketExtra(extra)}
                      className={`rounded-xl px-4 py-3 font-bold border ${
                        selectedMarketExtras.includes(extra)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-slate-900 border-slate-700 hover:border-blue-500"
                      }`}
                    >
                      {extra}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Ilan Basligi
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ornek: Charon 120 Level Bedensel Savasci"
              className="w-full rounded-xl px-4 py-3 bg-white text-black placeholder:text-gray-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">Fiyat</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1250"
              className="w-full rounded-xl px-4 py-3 bg-white text-black placeholder:text-gray-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              WhatsApp Numaran
            </label>
            <input
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              placeholder="905321234567"
              className="w-full rounded-xl px-4 py-3 bg-white text-black placeholder:text-gray-500"
              required
            />
            <p className="text-xs text-slate-400 mt-2">
              Basinda + olmadan yaz. Ornek: 905321234567
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Ilan Suresi
            </label>
            <select
              value={listingDurationDays}
              onChange={(e) => setListingDurationDays(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
              required
            >
              <option value="7">7 Gun</option>
              <option value="15">15 Gun</option>
              <option value="30">30 Gun</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Maksimum Teslimat Suresi
            </label>
            <select
              value={maxDeliveryHours}
              onChange={(e) => setMaxDeliveryHours(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
              required
            >
              <option value="1">1 Saat</option>
              <option value="3">3 Saat</option>
              <option value="6">6 Saat</option>
              <option value="12">12 Saat</option>
              <option value="24">24 Saat</option>
              <option value="48">48 Saat</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Ilan Fotografi
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">Aciklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ilan detaylarini yaz..."
              className="w-full min-h-32 rounded-xl px-4 py-3 bg-white text-black placeholder:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold"
          >
            Ilani Yayinla
          </button>
        </form>

        {message && <p className="mt-5 text-sm text-slate-300">{message}</p>}
      </div>
    </main>
  );
}