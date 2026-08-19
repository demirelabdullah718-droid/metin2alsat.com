"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Message = {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  listings?: { title: string; price: number; server: string } | null;
};

export default function MesajlarPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        window.location.href = "/login";
        return;
      }

      setCurrentUserId(userId);

      // Kullanıcının gönderdiği veya aldığı tüm mesajları ilgili ilan bilgileriyle çekelim
      const { data, error } = await supabase
        .from("messages")
        .select("*, listings(title, price, server)")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Mesaj yükleme hatası:", error.message);
      } else if (data) {
        setMessages(data as Message[]);
      }

      setLoading(false);
    }

    loadMessages();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <p className="text-slate-300">Mesajlar yükleniyor...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-white px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <a href="/" className="text-yellow-400 font-bold inline-block">
          ← Ana Sayfaya Dön
        </a>

        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-extrabold text-yellow-400 flex items-center gap-2">
            <span>💬</span> Mesajlarım ve Sohbetler
          </h1>
          <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400 font-bold">
            Toplam: {messages.length} Mesaj
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <p className="text-xl font-bold text-slate-300">Henüz hiç mesajınız bulunmuyor.</p>
            <p className="text-sm text-slate-500">
              İlan detay sayfalarındaki &quot;Site İçi Mesaj Gönder&quot; butonunu kullanarak satıcılarla iletişime geçebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isSentByMe = msg.sender_id === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    isSentByMe
                      ? "bg-slate-900/90 border-slate-800"
                      : "bg-slate-900 border-yellow-400/40 shadow-lg shadow-yellow-400/5"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-3 border-b border-slate-800/80">
                    <div>
                      <a
                        href={`/ilan/${msg.listing_id}`}
                        className="text-sm font-extrabold text-yellow-400 hover:underline flex items-center gap-1.5"
                      >
                        <span>📦</span> {msg.listings?.title || "İlan Detayına Git"}
                      </a>
                      {msg.listings && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {msg.listings.server} • {Number(msg.listings.price).toLocaleString("tr-TR")} TL
                        </p>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(msg.created_at).toLocaleString("tr-TR")}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed py-2">
                    {msg.content}
                  </p>

                  <div className="mt-3 flex justify-between items-center pt-2">
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-xl ${
                        isSentByMe
                          ? "bg-slate-800 text-slate-400 border border-slate-700"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {isSentByMe ? "📤 Giden Mesaj" : "📥 Gelen Mesaj"}
                    </span>

                    <a
                      href={`/ilan/${msg.listing_id}`}
                      className="text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      İlana Git & Satıcıya Yaz →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}