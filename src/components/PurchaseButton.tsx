"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type PurchaseButtonProps = {
  listingId: string;
  sellerId: string;
  listingStatus?: string | null;
};

export default function PurchaseButton({
  listingId,
  sellerId,
  listingStatus,
}: PurchaseButtonProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const [alreadyRequested, setAlreadyRequested] = useState(false);

  useEffect(() => {
    loadState();
  }, [listingId]);

  async function loadState() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id || null);

    if (!user?.id) return;

    const { data } = await supabase
      .from("purchase_requests")
      .select("id,status")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .in("status", ["pending", "approved"])
      .maybeSingle();

    setAlreadyRequested(Boolean(data));
  }

  async function createRequest() {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    if (userId === sellerId) {
      setMessage("Kendi ilanini satin alamazsin.");
      return;
    }

    setWorking(true);
    setMessage("");

    const { error } = await supabase
      .from("purchase_requests")
      .insert({
        listing_id: listingId,
        buyer_id: userId,
        seller_id: sellerId,
        note: note.trim() || null,
        status: "pending",
      });

    if (error) {
      setMessage("Talep gonderilemedi: " + error.message);
      setWorking(false);
      return;
    }

    setAlreadyRequested(true);
    setMessage(
      "Satin alma talebin yonetime gonderildi. Onay sonrasi iletisim kurulacak."
    );
    setWorking(false);
  }

  if (listingStatus === "sold") {
    return (
      <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-center">
        <p className="text-xl font-black text-red-300">BU URUN SATILDI</p>
        <p className="mt-2 text-sm text-red-100/80">
          Ilan gecmis ve fiyat arastirmasi icin yayinda tutuluyor.
        </p>
      </div>
    );
  }

  if (listingStatus !== "active") {
    return null;
  }

  if (alreadyRequested) {
    return (
      <div className="mt-6 rounded-2xl border border-yellow-500/40 bg-yellow-400/10 p-5 text-center">
        <p className="font-black text-yellow-200">
          Satin alma talebin onay bekliyor.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
      <h3 className="text-xl font-black text-emerald-300">
        Bu urunu satin almak istiyorum
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-300">
        Butona bastiginda yonetime satin alma talebi gider. Bu buton tek
        basina odeme cekmez.
      </p>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={500}
        className="mt-4 min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-emerald-400"
        placeholder="Yonetim icin not — istege bagli"
      />

      <button
        type="button"
        disabled={working}
        onClick={createRequest}
        className="mt-4 w-full rounded-xl bg-emerald-500 px-6 py-4 text-lg font-black text-white hover:bg-emerald-600 disabled:opacity-50"
      >
        {working ? "Gonderiliyor..." : "Urunu Satin Al"}
      </button>

      {message && (
        <p className="mt-4 rounded-xl bg-slate-950 p-4 text-sm text-slate-300">
          {message}
        </p>
      )}
    </div>
  );
}
