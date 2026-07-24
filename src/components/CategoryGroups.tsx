type CategoryGroupsProps = {
  selectedCategory: string;
  onSelect: (category: string) => void;
};

const metin2Categories = [
  "Tumu",
  "Karakter",
  "Hesap",
  "Yang",
  "Won Al",
  "Won Sat",
  "Esya",
  "EP",
];

const gamingCategories = [
  "Oyuncu Bilgisayari",
  "Oyuncu Koltugu",
  "Monitor",
  "Ekran Karti",
  "Islemci",
  "Anakart",
  "RAM",
  "SSD",
  "PSU",
  "Klavye",
  "Mouse",
  "Kulaklik",
];

export default function CategoryGroups({
  selectedCategory,
  onSelect,
}: CategoryGroupsProps) {
  function categoryButton(category: string) {
    const active = selectedCategory === category;

    return (
      <button
        key={category}
        type="button"
        onClick={() => onSelect(category)}
        className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
          active
            ? "border-yellow-400 bg-yellow-400 text-black"
            : "border-slate-700 bg-slate-950/80 text-slate-200 hover:border-yellow-400"
        }`}
      >
        {category}
      </button>
    );
  }

  return (
    <section className="px-4 pb-14 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-400">
            Kategoriler
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-white">
            Aradigin Urun Grubunu Sec
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-yellow-500/20 bg-slate-900/90 p-6">
            <h3 className="text-2xl font-extrabold text-yellow-400">
              Metin2
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Metin2 TR karakter, hesap, won, yang ve esya ilanlari.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {metin2Categories.map(categoryButton)}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/90 p-6">
            <h3 className="text-2xl font-extrabold text-emerald-400">
              Gaming ve PC
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Oyuncu ekipmanlari, bilgisayarlar ve PC parcalari.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {gamingCategories.map(categoryButton)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}