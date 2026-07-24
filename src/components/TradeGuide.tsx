const tradeSteps = [
  "İşlem yapacak taraflar; ürün, fiyat, sunucu, teslimat ve ödeme detaylarını post açılmadan önce tamamen konuşup anlaşmalıdır.",
  "Taraflar site yöneticileriyle iletişime geçtikten sonra, ticaretin toplam tutarı ve bütün detayları belirtilerek onay postu açılır.",
  "Gerekli kefiller postun yorum bölümüne kefillik tutarlarını yazar. Yeterli kefil sağlandıktan sonra yönetim postu onaylar.",
  "Alıcı, işlem tutarını yönetimin bildirdiği IBAN'a veya oyun içinde yönetimin belirttiği karaktere teslim eder.",
  "Yönetim ödemeyi teslim aldığında satıcı, gerekli ürün veya hesap bilgilerini alıcıya iletir.",
];

const priceRules = [
  "500-25.000 TL arasındaki işlemlerde iki taraftan en az birinin yeterli kefili bulunuyorsa, taraflar post onayını aldıktan sonra kendi aralarında ticaret yapabilir.",
  "25.000 TL üzerindeki işlemlerde admin aracılığı zorunludur.",
  "25.000 TL üzerindeki işlemlerde admin aracılık bedeli toplam ticaret tutarının %5'i olarak uygulanır.",
  "Kefil başına belirtilen sorumluluk tutarı 2.500 TL'dir.",
  "Post açıldıktan sonra iptal edilen işlemlerde %10 cayma bedeli uygulanır.",
  "Yönetim onayı alınmadan yapılan işlemlerde oluşabilecek mağduriyetler karşılanmaz ve kefillerden tahsilat yapılmaz.",
];

const accountRules = [
  "Hesap satışlarında ödeme, alıcının hesabı teslim almasından sonra sekizinci günün sonunda satıcıya aktarılır.",
  "Alıcı sekiz günlük kontrol süresinde hesapla ilgili bir sorun yaşarsa, kanıtlarıyla birlikte yönetime bilgi vermelidir.",
  "Hesabın geçmişinden kaynaklanan ban, EP yükleme veya kredi kartı kısıtlamaları gibi durumlar; işlem öncesinde yazılı olarak kabul edilen şartlara ve sunulan kanıtlara göre değerlendirilir.",
];

const itemWonRules = [
  "İtem veya Won ticaretinde ödeme önce yönetim tarafından teslim alınır.",
  "Satıcı, anlaşılan item veya Won miktarını alıcıya teslim eder.",
  "Alıcı teslimatı doğruladıktan sonra ödeme satıcıya aktarılır.",
];

const groupRules = [
  "Grupta ırkçılık, siyaset, küfür, hakaret ve ağır argo içeren paylaşımlar yasaktır.",
  "Hile, bug, çalıntı hesap, çalıntı Won veya şüpheli ürün satışı yasaktır.",
  "Üçüncü taraf satış platformlarından alınan şüpheli ürünlerin grupta satışı yasaktır. Tekrarı halinde ikinci uyarıda gruptan uzaklaştırma uygulanabilir.",
  "Facebook ve WhatsApp grupları; ilan paylaşımı, çekiliş, oyun bilgilendirmeleri ve topluluk sohbetleri içindir.",
  "Aynı ilanı 12 saat içinde birden fazla kez paylaşmak spam kabul edilir ve uyarı sebebidir.",
  "Spam veya grup kurallarının tekrarı halinde üçüncü uyarıda kullanıcı gruptan uzaklaştırılır.",
];

function RuleList({ items }: { items: string[] }) {
  return (
    <div className="mt-5 space-y-3">
      {items.map((item, index) => (
        <div
          key={item}
          className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-black">
            {index + 1}
          </span>

          <p className="text-sm leading-6 text-slate-300">{item}</p>
        </div>
      ))}
    </div>
  );
}

export default function TradeGuide() {
  return (
    <section
      id="ticaret-kurallari"
      className="scroll-mt-32 border-t border-slate-800 bg-[#050b16] px-4 py-16 md:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
            Güvenli Ticaret Rehberi
          </p>

          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
            Ticaret Nasıl Yapılır?
          </h2>

          <p className="mx-auto mt-4 max-w-4xl leading-7 text-slate-300">
            Oyuna yeni başladıysanız, toplulukta tanınan biri
            değilseniz veya ticaret yapacağınız kişiyi
            tanımıyorsanız işlemden önce mutlaka site
            yönetimiyle iletişime geçin.
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-yellow-500/30 bg-slate-900 p-6">
            <h3 className="text-2xl font-black text-yellow-400">
              Ticaret Süreci
            </h3>
            <RuleList items={tradeSteps} />
          </article>

          <article className="rounded-3xl border border-emerald-500/30 bg-slate-900 p-6">
            <h3 className="text-2xl font-black text-emerald-400">
              Tutarlar, Kefil ve Ücretler
            </h3>
            <RuleList items={priceRules} />
          </article>

          <article className="rounded-3xl border border-purple-500/30 bg-slate-900 p-6">
            <h3 className="text-2xl font-black text-purple-300">
              Hesap Satışı
            </h3>
            <RuleList items={accountRules} />
          </article>

          <article className="rounded-3xl border border-cyan-500/30 bg-slate-900 p-6">
            <h3 className="text-2xl font-black text-cyan-300">
              İtem ve Won Ticareti
            </h3>
            <RuleList items={itemWonRules} />
          </article>
        </div>

        <article className="mt-6 rounded-3xl border border-red-500/30 bg-slate-900 p-6">
          <h3 className="text-2xl font-black text-red-300">
            Grup Kuralları
          </h3>
          <RuleList items={groupRules} />
        </article>

        <div className="mt-6 rounded-2xl border border-yellow-500/40 bg-yellow-400/10 p-5 text-center">
          <p className="font-bold leading-7 text-yellow-200">
            Ticaretin bütün detayları post açılmadan
            önce konuşulmalı ve taraflarca yazılı olarak
            onaylanmalıdır.
          </p>
        </div>
      </div>
    </section>
  );
}
