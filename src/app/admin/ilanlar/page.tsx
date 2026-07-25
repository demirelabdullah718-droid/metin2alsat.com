"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type ListingStatus = "pending" | "active" | "rejected";

type Listing = {
  id: string;
  user_id: string | null;
  title: string;
  category: string;
  server: string;
  price: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
  status: ListingStatus;
  rejection_reason: string | null;
};

export default function AdminListingsPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<ListingStatus>("pending");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadListings();
    }
  }, [authorized, filter]);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase.rpc("is_admin");

    if (error || data !== true) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    setAdminId(user.id);
    setAuthorized(true);
  }

  async function loadListings() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,user_id,title,category,server,price,image_url,description,created_at,status,rejection_reason"
      )
      .eq("status", filter)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Ilanlar alinamadi: " + error.message);
      setListings([]);
      setLoading(false);
      return;
    }

    setListings((data || []) as Listing[]);
    setLoading(false);
  }

  async function approveListing(id: string) {
    if (!adminId) return;

    setWorkingId(id);
    setMessage("");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "active",
        rejection_reason: null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq("id", id);

    if (error) {
      setMessage("Ilan onaylanamadi: " + error.message);
      setWorkingId(null);
      return;
    }

    setMessage("Ilan onaylandi ve yayina alindi.");
    setWorkingId(null);
    await loadListings();
  }

  async function rejectListing(id: string) {
    if (!adminId) return;

    const reason = String(reasons[id] || "").trim();

    if (reason.length < 5) {
      setMessage("Ilani reddetmek icin aciklayici bir sebep yazmalisin.");
      return;
    }

    setWorkingId(id);
    setMessage("");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq("id", id);

    if (error) {
      setMessage("Ilan reddedilemedi: " + error.message);
      setWorkingId(null);
      return;
    }

    setMessage("Ilan reddedildi. Sebep ilan sahibine gosterilecek.");
    setWorkingId(null);
    await loadListings();
  }

  function tabClass(status: ListingStatus) {
    const base =
      "rounded-xl px-5 py-3 text-sm font-black transition ";

    if (filter === status) {
      return base + "bg-yellow-400 text-black";
    }

    return base + "border border-slate-700 bg-slate-900 text-slate-200 hover:border-yellow-400";
  }

  if (authorized === null || loading) {
    return (
      <main className="min-h-screen bg-[#030814] p-8 text-white">
        <p className="text-slate-300">Yonetim paneli yukleniyor...</p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030814] p-8 text-white">
        <div className="max-w-xl rounded-3xl border border-red-500/30 bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-black text-red-300">
            Yetkisiz Erisim
          </h1>

          <p className="mt-4 text-slate-300">
            Bu sayfaya yalnizca Metin2AlSat yoneticileri erisebilir.
          </p>

          <a
            href="/"
            className="mt-6 inline-block rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
          >
            Ana Sayfaya Don
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030814] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-800 pb-7 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
              Metin2AlSat Yonetim
            </p>

            <h1 className="mt-2 text-3xl font-black md:text-5xl">
              Ilan Onay Paneli
            </h1>

            <p className="mt-3 text-slate-400">
              Ilanlari inceleyebilir, onaylayabilir veya sebep belirterek reddedebilirsin.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/"
              className="rounded-xl border border-slate-700 px-5 py-3 font-bold hover:border-yellow-400"
            >
              Siteye Don
            </a>

            <button
              type="button"
              onClick={loadListings}
              className="rounded-xl bg-emerald-500 px-5 py-3 font-black hover:bg-emerald-600"
            >
              Yenile
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={tabClass("pending")}
          >
            Onay Bekleyenler
          </button>

          <button
            type="button"
            onClick={() => setFilter("rejected")}
            className={tabClass("rejected")}
          >
            Reddedilenler
          </button>

          <button
            type="button"
            onClick={() => setFilter("active")}
            className={tabClass("active")}
          >
            Yayindaki Ilanlar
          </button>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-400/10 p-4 font-semibold text-yellow-200">
            {message}
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-lg text-slate-300">
              Bu bolumde ilan bulunmuyor.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {listings.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-slate-800 text-5xl font-black text-slate-500">
                  ILAN
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-sm font-bold text-yellow-300">
                      {item.category}
                    </span>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-bold text-slate-300">
                      {item.server}
                    </span>
                  </div>

                  <span className="text-xl font-black text-emerald-400">
                    {Number(item.price).toLocaleString("tr-TR")} TL
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-black">{item.title}</h2>

                {item.description && (
                  <p className="mt-4 whitespace-pre-line leading-7 text-slate-300">
                    {item.description}
                  </p>
                )}

                <div className="mt-5 rounded-xl bg-slate-950 p-4 text-xs text-slate-400">
                  <p>Kullanici ID: {item.user_id || "Bilinmiyor"}</p>
                  <p className="mt-1">
                    Tarih: {new Date(item.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>

                {filter === "pending" && (
                  <>
                    <textarea
                      value={reasons[item.id] || ""}
                      onChange={(event) =>
                        setReasons({
                          ...reasons,
                          [item.id]: event.target.value,
                        })
                      }
                      className="mt-5 min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-red-400"
                      placeholder="Ret sebebi: Eksik aciklama, yanlis kategori, uygunsuz fiyat, yetersiz gorsel..."
                    />

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <a
                        href={"/ilan/" + item.id}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-slate-700 px-5 py-3 text-center font-black hover:border-yellow-400"
                      >
                        Ilani Incele
                      </a>

                      <button
                        type="button"
                        disabled={workingId === item.id}
                        onClick={() => rejectListing(item.id)}
                        className="rounded-xl bg-red-500 px-5 py-3 font-black hover:bg-red-600 disabled:opacity-50"
                      >
                        Reddet
                      </button>

                      <button
                        type="button"
                        disabled={workingId === item.id}
                        onClick={() => approveListing(item.id)}
                        className="rounded-xl bg-emerald-500 px-5 py-3 font-black hover:bg-emerald-600 disabled:opacity-50"
                      >
                        Onayla
                      </button>
                    </div>
                  </>
                )}

                {filter === "rejected" && (
                  <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm font-black text-red-300">
                      Ret Sebebi
                    </p>
                    <p className="mt-2 leading-6 text-red-100">
                      {item.rejection_reason || "Sebep belirtilmemis."}
                    </p>
                  </div>
                )}

                {filter === "active" && (
                  <a
                    href={"/ilan/" + item.id}
                    className="mt-5 block rounded-xl bg-yellow-400 px-5 py-3 text-center font-black text-black hover:bg-yellow-500"
                  >
                    Yayindaki Ilani Ac
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
