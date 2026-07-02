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
};

export default function IlanDuzenlePage() {
  const params = useParams();
  const id = params.id as string;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Karakter");
  const [server, setServer] = useState("");
  const [price, setPrice] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListing() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user) {
        window.location.href = "/login";
        return;
      }

      const userId = sessionData.session.user.id;
      setCurrentUserId(userId);

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setMessage("İlan bulunamadı.");
        setLoading(false);
        return;
      }

      const listing = data as Listing;

      if (listing.user_id !== userId) {
        setMessage("Bu ilanı düzenleme yetkin yok.");
        setLoading(false);
        return;
      }

      setTitle(listing.title);
      setCategory(listing.category);
      setServer(listing.server);
      setPrice(String(listing.price));
      setSellerPhone(listing.seller_phone || "");
      setDescription(listing.description || "");
      setCurrentImageUrl(listing.image_url);

      setLoading(false);
    }

    if (id) {
      loadListing();
    }
  }, [id]);

  async function uploadImage() {
    if (!selectedImage || !currentUserId) {
      return currentImageUrl;
    }

    const fileExt = selectedImage.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${currentUserId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(filePath, selectedImage);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!currentUserId) {
      setMessage("Önce giriş yapmalısın.");
      return;
    }

    setMessage("İlan güncelleniyor...");

    try {
      const cleanPhone = sellerPhone.replace(/\D/g, "");
      const imageUrl = await uploadImage();

      const { error } = await supabase
        .from("listings")
        .update({
          title,
          category,
          server,
          price: Number(price),
          seller_phone: cleanPhone,
          image_url: imageUrl,
          description,
        })
        .eq("id", id)
        .eq("user_id", currentUserId);

      if (error) {
        setMessage("Güncelleme hatası: " + error.message);
        return;
      }

      setMessage("İlan güncellendi. Detay sayfasına dönülüyor...");

      setTimeout(() => {
        window.location.href = `/ilan/${id}`;
      }, 800);
    } catch (error: any) {
      setMessage("Fotoğraf yükleme hatası: " + error.message);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-300">İlan yükleniyor...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">
              İlanı Güncelle
            </h1>
            <p className="text-slate-400 mt-2">
              İlan bilgilerini düzenle.
            </p>
          </div>

          <a href={`/ilan/${id}`} className="text-sm text-yellow-400 font-bold">
            İlan Detayına Dön
          </a>
        </div>

        {message && (
          <p className="mb-5 text-sm text-slate-300">
            {message}
          </p>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm text-slate-300">
              İlan Başlığı
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
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
              required
            >
              <option>Karakter</option>
              <option>Yang</option>
              <option>Won</option>
              <option>Eşya</option>
              <option>EP</option>
              <option>Hesap</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Sunucu
            </label>
            <input
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
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
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
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
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
              required
            />
          </div>

          {currentImageUrl && (
            <div>
              <label className="block mb-2 text-sm text-slate-300">
                Mevcut Fotoğraf
              </label>
              <img
                src={currentImageUrl}
                alt="Mevcut ilan fotoğrafı"
                className="w-full rounded-xl max-h-72 object-cover"
              />
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Yeni Fotoğraf Seç
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              className="w-full rounded-xl px-4 py-3 bg-white text-black"
            />
            <p className="text-xs text-slate-400 mt-2">
              Boş bırakırsan mevcut fotoğraf kalır.
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-32 rounded-xl px-4 py-3 bg-white text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold"
          >
            Güncelle
          </button>
        </form>
      </div>
    </main>
  );
}
