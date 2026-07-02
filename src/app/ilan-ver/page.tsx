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
  "Arkadaşlar",
];

const categories = [
  "Karakter",
  "Yang",
  "Won Al",
  "Won Sat",
  "Eşya",
  "EP",
  "Hesap",
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

  const [message, setMessage] = useState("");

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

  async function uploadImage() {
    if (!selectedImage || !userId) return null;

    const fileExt = selectedImage.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(filePath, selectedImage);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!userId) {
      setMessage("Önce giriş yapmalısın.");
      return;
    }

    setMessage("İlan kaydediliyor...");

    try {
      const durationDays = Number(listingDurationDays);
      const expiresAt = new Date(
        Date.now() + durationDays * 24 * 60 * 60 * 1000
      ).toISOString();

      const imageUrl = await uploadImage();

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
        status: "active",
      });

      if (error) {
        setMessage("Hata: " + error.message);
        return;
      }

      setMessage("İlan başarıyla eklendi!");

      setTitle("");
      setCategory("Karakter");
      setServer("Marmara");
      setPrice("");
      setSellerPhone("");
      setListingDurationDays("7");
      setMaxDeliveryHours("24");
      setDescription("");
      setSelectedImage(null);
    } catch (error: any) {
      setMessage("Hata: " + error.message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">İlan Ver</h1>
            <p className="text-slate-400 mt-2">
              Metin2 ilanını birkaç saniyede oluştur.
            </p>
          </div>

          <a href="/" className="text-sm text-yellow-400 font-bold">
            Ana Sayfa
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Sunucu
            </label>
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
            <label className="block mb-2 text-sm text-slate-300">
              Kategori
            </label>
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

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              İlan Başlığı
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örnek: Marmara 500 Won Satılık"
              className="w-full rounded-xl px-4 py-3 bg-white text-black placeholder:text-gray-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Fiyat
            </label>
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
              Başında + olmadan yaz. Örnek: 905321234567
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              İlan Süresi
            </label>
            <select
              value={listingDurationDays}
              onChange={(e) => setListingDurationDays(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
              required
            >
              <option value="7">7 Gün</option>
              <option value="15">15 Gün</option>
              <option value="30">30 Gün</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Maksimum Teslimat Süresi
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
              İlan Fotoğrafı
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
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="İlan detaylarını yaz..."
              className="w-full min-h-32 rounded-xl px-4 py-3 bg-white text-black placeholder:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold"
          >
            İlanı Yayınla
          </button>
        </form>

        {message && <p className="mt-5 text-sm text-slate-300">{message}</p>}
      </div>
    </main>
  );
}