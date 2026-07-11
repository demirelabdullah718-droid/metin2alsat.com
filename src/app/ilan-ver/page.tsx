"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

type SubCharacter = {
  title?: string;
  class?: string;
  build?: string;
  level?: string;
  alchemyPanel?: string;
  biolog?: string;
  inventoryNote?: string;
  extraNote?: string;
};

type CharacterDetails = {
  class?: string;
  build?: string;
  biolog?: string;
  alchemy?: Record<string, string>;
  alchemyBonuses?: Record<string, string[]>;
  marketExtras?: string[];
  subCharacters?: SubCharacter[];
};

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

const buildsByClass: Record<string, string[]> = {
  Savasci: ["Bedensel", "Zihinsel"],
  Saman: ["Kritikci / Ejderha Gucu", "Sifaci / Iyilestirme"],
  Sura: ["Karabuyu", "Keskinlik / Buyulu Silah"],
  Ninja: ["Okcu", "Bicakci"],
  "Lycan / Kurt": ["Lycan / Kurt"],
};

const stones = ["Elmas", "Yesim", "Yakut", "Grena", "Ametist", "Safir", "Oniks"];

const purityOptions = ["Yok", "Mat", "Parlak", "Tertemiz", "Mukemmel", "Kusursuz"];

const bonusOptions: Record<string, string[]> = {
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

const subCharacterBuilds = [
  "-",
  "Bedensel",
  "Zihinsel",
  "Karabuyu",
  "Keskinlik / Buyulu Silah",
  "Okcu",
  "Bicakci",
  "Kritikci / Ejderha Gucu",
  "Sifaci / Iyilestirme",
  "Lycan / Kurt",
];

export default function CreateListingPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Karakter");
  const [server, setServer] = useState("Marmara");
  const [price, setPrice] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [listingDurationDays, setListingDurationDays] = useState("7");
  const [maxDeliveryHours, setMaxDeliveryHours] = useState("24");
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

  const [marketExtraNote, setMarketExtraNote] = useState("");
  const [subCharacters, setSubCharacters] = useState<SubCharacter[]>([]);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const showCharacterPanel = category === "Karakter" || category === "Hesap";

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getSession();

      if (!data.session?.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(data.session.user.id);
    }

    getUser();
  }, []);

  function handleClassChange(value: string) {
    setCharacterClass(value);
    setCharacterBuild(buildsByClass[value]?.[0] || "-");
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

      if (current.length >= 3) {
        setMessage("Bir simya tasinda en fazla 3 efsun secebilirsin.");
        return prev;
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

  function addSubCharacter() {
    if (subCharacters.length >= 5) {
      setMessage("En fazla 5 alt karakter ekleyebilirsin.");
      return;
    }

    setSubCharacters((prev) => [
      ...prev,
      {
        title: "",
        class: "Ninja",
        build: "-",
        level: "",
        alchemyPanel: "",
        biolog: "",
        inventoryNote: "",
        extraNote: "",
      },
    ]);
  }

  function updateSubCharacter(index: number, field: keyof SubCharacter, value: string) {
    setSubCharacters((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeSubCharacter(index: number) {
    setSubCharacters((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!userId) {
      setMessage("Giris yapman gerekiyor.");
      return;
    }

    if (!title || !price) {
      setMessage("Baslik ve fiyat zorunlu.");
      return;
    }

    setSaving(true);
    setMessage("Ilan kaydediliyor...");

    try {
      const imageUrl = await uploadImage();

      const expiresAt = new Date(
        Date.now() + Number(listingDurationDays) * 24 * 60 * 60 * 1000
      ).toISOString();

      const cleanSubCharacters = subCharacters.filter((item) => {
        return (
          item.title ||
          item.level ||
          item.alchemyPanel ||
          item.biolog ||
          item.inventoryNote ||
          item.extraNote ||
          (item.class && item.class !== "Ninja") ||
          (item.build && item.build !== "-")
        );
      });

      const characterDetails: CharacterDetails = showCharacterPanel
        ? {
            class: characterClass,
            build: characterBuild,
            biolog,
            alchemy,
            alchemyBonuses,
            marketExtras: marketExtraNote.trim() ? [marketExtraNote.trim()] : [],
            subCharacters: cleanSubCharacters,
          }
        : {};

      const { data, error } = await supabase
        .from("listings")
        .insert({
          user_id: userId,
          title,
          category,
          server,
          price: Number(price),
          seller_phone: sellerPhone,
          description,
          listing_duration_days: Number(listingDurationDays),
          max_delivery_hours: Number(maxDeliveryHours),
          expires_at: expiresAt,
          image_url: imageUrl,
          character_details: characterDetails,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        setMessage("Hata: " + error.message);
        setSaving(false);
        return;
      }

      window.location.href = `/ilan/${data.id}`;
    } catch (error) {
      const err = error as Error;
      setMessage("Hata: " + err.message);
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="text-3xl font-bold text-yellow-400"
          >
            Metin2AlSat
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-xl font-bold"
          >
            Ana Sayfa
          </button>
        </div>

        <h1 className="text-4xl font-extrabold mb-2">Ilan Ver</h1>
        <p className="text-slate-400 mb-8">
          Karakter ve hesap ilanlarinda ana karakter, simya ve istege bagli alt karakter ekleyebilirsin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-5">
              Temel Bilgiler
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Ilan Basligi
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white text-black"
                  placeholder="Ornek: 2x Ninja Hesap"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white text-black"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Sunucu
                </label>
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white text-black"
                >
                  {servers.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Fiyat TL
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  className="w-full rounded-xl px-4 py-3 bg-white text-black"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  WhatsApp / Telefon
                </label>
                <input
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white text-black"
                  placeholder="905xxxxxxxxx"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Ilan Gorseli
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  className="w-full rounded-xl px-4 py-3 bg-white text-black"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Ilan Suresi Gun
                </label>
                <input
                  value={listingDurationDays}
                  onChange={(e) => setListingDurationDays(e.target.value)}
                  type="number"
                  className="w-full rounded-xl px-4 py-3 bg-white text-black"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Maksimum Teslim Saati
                </label>
                <input
                  value={maxDeliveryHours}
                  onChange={(e) => setMaxDeliveryHours(e.target.value)}
                  type="number"
                  className="w-full rounded-xl px-4 py-3 bg-white text-black"
                />
              </div>
            </div>
          </section>

          {showCharacterPanel && (
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-5">
                Ana Karakter Bilgileri
              </h2>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block mb-2 text-sm text-slate-300">
                    Sinif
                  </label>
                  <select
                    value={characterClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-white text-black"
                  >
                    {characterClasses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm text-slate-300">
                    Build
                  </label>
                  <select
                    value={characterBuild}
                    onChange={(e) => setCharacterBuild(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-white text-black"
                  >
                    {(buildsByClass[characterClass] || ["-"]).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm text-slate-300">
                    Biyolog Durumu
                  </label>
                  <input
                    value={biolog}
                    onChange={(e) => setBiolog(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-white text-black"
                    placeholder="Ornek: Lider notu"
                  />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-bold text-yellow-400">
                    Kucuk Simya Paneli
                  </h3>
                  <p className="text-sm text-slate-400">
                    Efsunlari gormek icin tas kutusunu ac.
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-3">
                  {stones.map((stone) => (
                    <details
                      key={stone}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-yellow-400">
                            {stone}
                          </span>
                          <span className="text-xs text-slate-400">
                            Efsun
                          </span>
                        </div>

                        <select
                          value={alchemy[stone] ?? "Yok"}
                          onChange={(e) =>
                            setAlchemy((prev) => ({
                              ...prev,
                              [stone]: e.target.value,
                            }))
                          }
                          className="w-full mt-2 rounded-lg px-3 py-2 bg-white text-black text-sm"
                        >
                          {purityOptions.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </summary>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {(bonusOptions[stone] || []).map((bonus) => (
                          <button
                            key={bonus}
                            type="button"
                            onClick={() => toggleAlchemyBonus(stone, bonus)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                              (alchemyBonuses[stone] || []).includes(bonus)
                                ? "bg-yellow-400 text-black border-yellow-400"
                                : "bg-slate-900 text-white border-slate-700"
                            }`}
                          >
                            {bonus}
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-yellow-400 mb-4">
                  Nesne Market Ozellikleri
                </h3>

                <textarea
                  value={marketExtraNote}
                  onChange={(e) => setMarketExtraNote(e.target.value)}
                  className="w-full min-h-28 rounded-xl px-4 py-3 bg-white text-black"
                  placeholder="Nazar tilsimi, site markasi, EP bakiyeniz vb urunleriniz varsa buraya yaziniz."
                />
              </div>
            </section>
          )}

          {showCharacterPanel && (
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-yellow-400">
                    Alt Karakterler
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Istege baglidir. Bos birakirsan ilana eklenmez.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSubCharacter}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-3 rounded-xl font-bold"
                >
                  + Alt Karakter Ekle
                </button>
              </div>

              {subCharacters.length === 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-300">
                  Alt karakter eklemek istemiyorsan bu bolumu bos birakabilirsin.
                </div>
              )}

              <div className="space-y-5">
                {subCharacters.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-yellow-400">
                        Alt Karakter {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeSubCharacter(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold"
                      >
                        Sil
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block mb-2 text-sm text-slate-300">
                          Baslik / Kisa Not
                        </label>
                        <input
                          value={item.title || ""}
                          onChange={(e) =>
                            updateSubCharacter(index, "title", e.target.value)
                          }
                          className="w-full rounded-xl px-4 py-3 bg-white text-black"
                          placeholder="Ornek: Sampiyon 1 Ninja"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm text-slate-300">
                          Sinif
                        </label>
                        <select
                          value={item.class || "Ninja"}
                          onChange={(e) =>
                            updateSubCharacter(index, "class", e.target.value)
                          }
                          className="w-full rounded-xl px-4 py-3 bg-white text-black"
                        >
                          {characterClasses.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm text-slate-300">
                          Build
                        </label>
                        <select
                          value={item.build || "-"}
                          onChange={(e) =>
                            updateSubCharacter(index, "build", e.target.value)
                          }
                          className="w-full rounded-xl px-4 py-3 bg-white text-black"
                        >
                          {subCharacterBuilds.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm text-slate-300">
                          Seviye / Durum
                        </label>
                        <input
                          value={item.level || ""}
                          onChange={(e) =>
                            updateSubCharacter(index, "level", e.target.value)
                          }
                          className="w-full rounded-xl px-4 py-3 bg-white text-black"
                          placeholder="Ornek: Sampiyon 1"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm text-slate-300">
                          Simya Paneli
                        </label>
                        <input
                          value={item.alchemyPanel || ""}
                          onChange={(e) =>
                            updateSubCharacter(index, "alchemyPanel", e.target.value)
                          }
                          className="w-full rounded-xl px-4 py-3 bg-white text-black"
                          placeholder="Ornek: Kusursuz Panel, Mitsi Mat Set"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm text-slate-300">
                          Biyolog Durumu
                        </label>
                        <input
                          value={item.biolog || ""}
                          onChange={(e) =>
                            updateSubCharacter(index, "biolog", e.target.value)
                          }
                          className="w-full rounded-xl px-4 py-3 bg-white text-black"
                          placeholder="Ornek: Lider notu, Buz topu"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm text-slate-300">
                          Envanter Notu
                        </label>
                        <input
                          value={item.inventoryNote || ""}
                          onChange={(e) =>
                            updateSubCharacter(index, "inventoryNote", e.target.value)
                          }
                          className="w-full rounded-xl px-4 py-3 bg-white text-black"
                          placeholder="Ornek: 13x uste giden 7g eldiven var"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm text-slate-300">
                          Ek Not
                        </label>
                        <input
                          value={item.extraNote || ""}
                          onChange={(e) =>
                            updateSubCharacter(index, "extraNote", e.target.value)
                          }
                          className="w-full rounded-xl px-4 py-3 bg-white text-black"
                          placeholder="Ornek: Depoda item var"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-5">
              Aciklama
            </h2>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-40 rounded-xl px-4 py-3 bg-white text-black"
              placeholder="Ilan aciklamasi..."
            />

            {message && (
              <p className="mt-5 text-slate-300">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-black py-4 rounded-xl font-bold disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Ilani Yayinla"}
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}