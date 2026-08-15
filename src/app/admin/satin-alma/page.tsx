"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type PurchaseRequest = {
  id: number;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  note: string | null;
  status: string;
  created_at: string;
  listings:
    | {
        title: string;
        server: string;
        price: number;
        image_url: string | null;
      }
    | {
        title: string;
        server: string;
        price: number;
        image_url: string | null;
      }[]
    | null;
};

export default function PurchaseAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

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
      return;
    }

    setAuthorized(true);
    await loadRequests();
  }

  async function loadRequests() {
    const { data, error } = await supabase
      .from("purchase_requests")
      .select(
        "id,listing_id,buyer_id,seller_id,note,status,created_at,listings(title,server,price,image_url)"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Talepler alinamadi: " + error.message);
      return;
    }

    setRequests((data || []) as PurchaseRequest[]);
  }

  async function approveRequest(id: number) {
    setWorkingId(id);
    setMessage("");

    const { error } = await supabase.rpc(
      "approve_purchase_request",
      { target_request_id: id }
    );

    if (error) {
      setMessage("Talep onaylanamadi: " + error.message);
      setWorkingId(null);
      return;
    }

    setMessage(
      "Satin alma talebi onaylandi. Ilan SATILDI olarak isaretlendi ve sitede kalmaya devam edecek."
    );
    setWorkingId(null);
    await loadRequests();
  }

  async function rejectRequest(id: number) {
    const reason = String(reasons[id] || "").trim();

    if (reason.length < 3) {
      setMessage("Ret icin en az 3 karakterlik aciklama yaz.");
      return;
    }

    setWorkingId(id);
    setMessage("");

    const { error } = await supabase.rpc(
      "reject_purchase_request",
      {
        target_request_id: id,
        reason,
      }
    );

    if (error) {
      setMessage("Talep reddedilemedi: " + error.message);
      setWorkingId(null);
      return;
    }

    setMessage("Satin alma talebi reddedildi.");
    setWorkingId(null);
    await loadRequests();
  }

  if (authorized === null) {
    return (
      <main className="min-h-screen bg-[#030814] p-8 text-white">
        Yetki kontrol ediliyor...
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030814] p-8 text-white">
        <div className="rounded-3xl border border-red-500/30 bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-black text-red-300">
            Yetkisiz Erisim
          </h1>
          <a
            href="/"
            className="mt-6 inline-block rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
          >
            Ana Sayfa
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030814] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-7 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
              Yonetim
            </p>
            <h1 className="mt-2 text-4xl font-black">
              Satin Alma Talepleri
            </h1>
          </div>

          <a
            href="/admin/ilanlar"
            className="rounded-xl border border-slate-700 px-5 py-3 text-center font-black hover:border-yellow-400"
          >
            Ilan Onay Paneli
          </a>
        </div>

        {message && (
          <p className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-400/10 p-4 text-yellow-200">
            {message}
          </p>
        )}

        <div className="mt-8 space-y-6">
          {requests.length === 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-300">
              Bekleyen satin alma talebi yok.
            </div>
          )}

          {requests.map((request) => {
            const listing = Array.isArray(request.listings)
              ? request.listings[0]
              : request.listings;

            return (
              <article
                key={request.id}
                className="grid overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 md:grid-cols-[240px_1fr]"
              >
                {listing?.image_url ? (
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="h-56 w-full object-cover md:h-full"
                  />
                ) : (
                  <div className="flex min-h-48 items-center justify-center bg-slate-800 font-black text-slate-500">
                    ILAN
                  </div>
                )}

                <div className="p-6">
                  <p className="text-sm font-black text-yellow-400">
                    {listing?.server || "Sunucu belirtilmedi"}
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    {listing?.title || "Ilan"}
                  </h2>

                  <p className="mt-3 text-2xl font-black text-emerald-400">
                    {Number(listing?.price || 0).toLocaleString("tr-TR")} TL
                  </p>

                  <div className="mt-4 rounded-xl bg-slate-950 p-4 text-xs text-slate-400">
                    <p className="break-all">
                      Alici ID: {request.buyer_id}
                    </p>
                    <p className="mt-2 break-all">
                      Satici ID: {request.seller_id}
                    </p>
                    <p className="mt-2">
                      Tarih:{" "}
                      {new Date(request.created_at).toLocaleString("tr-TR")}
                    </p>
                  </div>

                  {request.note && (
                    <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-300">
                      Alici notu: {request.note}
                    </p>
                  )}

                  <textarea
                    value={reasons[request.id] || ""}
                    onChange={(event) =>
                      setReasons({
                        ...reasons,
                        [request.id]: event.target.value,
                      })
                    }
                    className="mt-5 min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-red-400"
                    placeholder="Ret aciklamasi..."
                  />

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <a
                      href={`/ilan/${request.listing_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-slate-700 px-5 py-3 text-center font-black hover:border-yellow-400"
                    >
                      Ilani Ac
                    </a>

                    <button
                      type="button"
                      disabled={workingId === request.id}
                      onClick={() => rejectRequest(request.id)}
                      className="rounded-xl bg-red-500 px-5 py-3 font-black hover:bg-red-600 disabled:opacity-50"
                    >
                      Reddet
                    </button>

                    <button
                      type="button"
                      disabled={workingId === request.id}
                      onClick={() => approveRequest(request.id)}
                      className="rounded-xl bg-emerald-500 px-5 py-3 font-black hover:bg-emerald-600 disabled:opacity-50"
                    >
                      Satisi Onayla
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
