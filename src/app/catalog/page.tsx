import Link from "next/link";
import { getCatalog } from "@/lib/store";
import { formatNGN } from "@/lib/demo";

export default async function CatalogPage({ searchParams }: { searchParams: { q?: string; city?: string; max?: string } }) {
  const query = { keyword: searchParams.q, city: searchParams.city || undefined, maxPrice: searchParams.max ? Number(searchParams.max) : undefined };
  const { source, products, services } = await getCatalog(query);

  return (
    <div>
      <h1>Catalog ({source === "db" ? "local Postgres" : "demo data"})</h1>
      <form method="get" action="/catalog">
        <label htmlFor="q">Search</label>
        <input id="q" name="q" type="search" defaultValue={query.keyword ?? ""} placeholder="e.g. Ankara, tailoring…" />
        <label htmlFor="city">City</label>
        <input id="city" name="city" defaultValue={query.city ?? ""} placeholder="Lagos, Abuja…" />
        <label htmlFor="max">Max price (NGN)</label>
        <input id="max" name="max" inputMode="numeric" defaultValue={searchParams.max ?? ""} placeholder="50000" />
        <p><button className="btn btn-primary" type="submit">Filter</button></p>
      </form>

      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}><strong>{p.title}</strong> — {formatNGN(p.priceNGN)} — stock {p.stock} — {p.city} ({p.vendor})</li>
        ))}
        {products.length === 0 && <li>No products match.</li>}
      </ul>

      <h2>Services</h2>
      <ul>
        {services.map((s) => (
          <li key={s.id}>
            <strong>{s.title}</strong> — {formatNGN(s.priceNGN)} — {s.durationMin} min — {s.city} ({s.vendor}){" "}
            <Link href={`/book/${s.id}`}>Book</Link>
          </li>
        ))}
        {services.length === 0 && <li>No services match.</li>}
      </ul>
    </div>
  );
}
