export default function TicaretNasilYapilirPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <a href="/" className="text-yellow-400 font-bold">
          ← Ana sayfaya dön
        </a>

        <h1 className="text-4xl font-extrabold text-yellow-400 mt-8">
          Ticaret Nasıl Yapılır?
        </h1>

        <p className="text-slate-300 mt-4 leading-7">
          Metin2AlSat, oyuncuların Metin2 ilanlarını paylaşabileceği bir ilan platformudur.
          Alıcı ve satıcı arasındaki iletişim şu anda WhatsApp üzerinden sağlanır.
        </p>

        <section className="mt-8 space-y-6">
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-3">1. İlanı İncele</h2>
            <p className="text-slate-300 leading-7">
              Almak istediğin karakter, won, yang, EP veya eşya ilanını detaylıca incele.
              Fiyat, sunucu, açıklama, teslimat süresi ve satıcı iletişim bilgilerini kontrol et.
            </p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-3">2. Satıcıyla WhatsApp Üzerinden Görüş</h2>
            <p className="text-slate-300 leading-7">
              İlan detayındaki WhatsApp butonuna basarak satıcıyla iletişime geç.
              Ürün detaylarını, teslimat saatini ve ödeme şeklini netleştirmeden işlem yapma.
            </p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-3">3. Teslimat Süresine Dikkat Et</h2>
            <p className="text-slate-300 leading-7">
              Her ilanda maksimum teslimat süresi belirtilir. Satıcı bu süre içinde teslimat yapacağını kabul eder.
              Teslimat süresi sana uygun değilse satın alma işlemini yapmadan önce satıcıyla konuş.
            </p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-3">4. Güvenli Ticaret Kuralları</h2>
            <ul className="list-disc list-inside text-slate-300 space-y-2 leading-7">
              <li>Tanımadığın kişilere peşin ödeme yaparken dikkatli ol.</li>
              <li>İlan açıklaması ile satıcının söylediği bilgiler uyuşmuyorsa işlem yapma.</li>
              <li>Şüpheli fiyatlara, acele ettiren satıcılara ve sahte ekran görüntülerine dikkat et.</li>
              <li>Hesap bilgilerini, şifrelerini veya kişisel bilgilerini paylaşma.</li>
              <li>İşlem öncesi ürünün sunucusunu, karakter seviyesini, item özelliklerini ve teslimat şeklini netleştir.</li>
            </ul>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-3">5. Metin2AlSat Notu</h2>
            <p className="text-slate-300 leading-7">
              Bu ilk sürümde Metin2AlSat doğrudan ödeme aracılığı yapmaz. Alıcı ve satıcı kendi arasında anlaşır.
              İlerleyen sürümlerde güvenli ödeme, komisyon sistemi ve satıcı puanlama özellikleri eklenebilir.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
