"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Listing = {
  id: string;
  title: string;
  category: string;
  server: string;
  price: number;
  image_url: string | null;
  created_at: string;
  status: "pending" | "active" | "rejected";
  rejection_reason: string | null;
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMyListings();
  }, []);

  async function loadMyListings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,category,server,price,image_url,created_at,status,rejection_reason"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Ilanlarin alinamadi: " + error.message);
      setLoading(false);
      return;
    }

    setListings((data || []) as Listing[]);
    setLoading(false);
  }

  function statusText(status: Listing["status"]) {
    if (status === "active") return "Yayinda";
    if (status === "rejected") return "Onaylanmadi";
    return "Onay Bekliyor";
  }

  function statusClass(status: Listing["status"]) {
    if (status === "active") {
      return "bg-emerald-500/15 text-emerald-300";
    }

    if (status === "rejected") {
      return "bg-red-500/15 text-red-300";
    }

    return "bg-yellow-400/15 text-yellow-300";
  }

  return (
    <main className="min-h-screen bg-[#030814] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-800 pb-7 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
              Hesabim
            </p>

            <h1 className="mt-2 text-4xl font-black">Ilanlarim</h1>

            <p className="mt-3 text-slate-400">
              Ilanlarinin onay durumunu ve yonetim aciklamalarini buradan gorebilirsin.
            </p>
          </div>

          <a
            href="/ilan-ver"
            className="rounded-xl bg-emerald-500 px-6 py-3 text-center font-black hover:bg-emerald-600"
          >
            Yeni Ilan Ver
          </a>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {message}
          </div>
        )}

        {loading && (
          <p className="mt-8 text-slate-300">Ilanlarin yukleniyor...</p>
        )}

        {!loading && listings.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-slate-300">Henuz bir ilan olusturmamissin.</p>
          </div>
        )}

        <div className="mt-8 space-y-5">
          {listings.map((item) => (
            <article
              key={item.id}
              className="grid overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 md:grid-cols-[240px_1fr]"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-56 w-full object-cover md:h-full"
                />
              ) : (
                <div className="flex min-h-48 items-center justify-center bg-slate-800 text-4xl font-black text-slate-500">
                  ILAN
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-bold">
                      {item.category}
                    </span>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-bold">
                      {item.server}
                    </span>
                  </div>

                  <span
                    className={
                      "rounded-full px-4 py-2 text-sm font-black " +
                      statusClass(item.status)
                    }
                  >
                    {statusText(item.status)}
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-black">{item.title}</h2>

                <p className="mt-3 text-2xl font-black text-emerald-400">
                  {Number(item.price).toLocaleString("tr-TR")} TL
                </p>

                {item.status === "pending" && (
                  <div className="mt-5 rounded-2xl border border-yellow-500/30 bg-yellow-400/10 p-4">
                    <p className="font-bold text-yellow-200">
                      Ilanin yonetim onayi bekliyor. Onaylandiginda sitede yayina alinacak.
                    </p>
                  </div>
                )}

                {item.status === "rejected" && (
                  <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                    <p className="font-black text-red-300">
                      Ilaniniz su sebeple onaylanmadi:
                    </p>

                    <p className="mt-2 whitespace-pre-line leading-7 text-red-100">
                      {item.rejection_reason || "Yonetim tarafindan sebep belirtilmemis."}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  {item.status === "active" && (
                    <a
                      href={"/ilan/" + item.id}
                      className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black hover:bg-yellow-500"
                    >
                      Ilani Goruntule
                    </a>
                  )}

                  {(item.status === "pending" ||
                    item.status === "rejected") && (
                    <a
                      href={"/ilan-duzenle/" + item.id}
                      className="rounded-xl bg-slate-800 px-5 py-3 font-black hover:bg-slate-700"
                    >
                      Ilani Duzenle
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
