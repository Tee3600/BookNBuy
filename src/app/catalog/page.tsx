import Link from "next/link";
import { getCatalog } from "@/lib/store";
import { formatNGN } from "@/lib/demo";

// Classic, stylish catalog: cream paper, serif display type, forest + gold accents.
const C = { forest: "#0A2E1F", green: "#0E7C3E", gold: "#B8862B", cream: "#FAF6EC", ink: "#1C2420", muted: "#6B756D", card: "#FFFFFF", line: "#E7DCC3" };
const serif = "Georgia, 'Times New Roman', serif";

const filterInput: React.CSSProperties = { padding: "10px 14px", fontSize: ".95rem", border: `1px solid ${C.line}`, borderRadius: 10, background: "#fff", minWidth: 0 };
const card: React.CSSProperties = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" };
const price: React.CSSProperties = { fontFamily: serif, fontSize: "1.3rem", color: C.forest };
const vendor: React.CSSProperties = { color: C.muted, fontSize: ".85rem", letterSpacing: ".04em", textTransform: "uppercase" };
const btn: React.CSSProperties = { display: "inline-block", marginTop: 12, background: C.forest, color: "#fff", fontWeight: 700, padding: "10px 20px", borderRadius: 10, textDecoration: "none", textAlign: "center" };

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "B";
}

export default async function CatalogPage({ searchParams }: { searchParams: { q?: string; city?: string; max?: string } }) {
  const query = { keyword: searchParams.q, city: searchParams.city || undefined, maxPrice: searchParams.max ? Number(searchParams.max) : undefined };
  const { source, products, services } = await getCatalog(query);

  return (
    <div style={{ background: C.cream, color: C.ink, margin: "-24px -24px 0", padding: "0 24px 64px" }}>
      <header style={{ textAlign: "center", padding: "48px 0 8px" }}>
        <p style={{ ...vendor, color: C.gold }}>The Collection · {source === "db" ? "live" : "showcase"}</p>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(2rem, 5vw, 3rem)", margin: "8px 0", letterSpacing: "-.5px" }}>Shop &amp; Book, Beautifully</h1>
        <p style={{ color: C.muted, maxWidth: "56ch", margin: "0 auto" }}>Curated goods from verified vendors and appointments with trusted professionals.</p>
      </header>

      <form method="get" action="/catalog" style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, margin: "24px auto", maxWidth: 860 }}>
        <input id="q" name="q" type="search" defaultValue={query.keyword ?? ""} placeholder="Search — Ankara, tailoring…" style={{ ...filterInput, flex: "2 1 220px" }} />
        <input id="city" name="city" defaultValue={query.city ?? ""} placeholder="City" style={{ ...filterInput, flex: "1 1 140px" }} />
        <input id="max" name="max" inputMode="numeric" defaultValue={searchParams.max ?? ""} placeholder="Max ₦" style={{ ...filterInput, flex: "1 1 120px" }} />
        <button type="submit" style={{ background: C.gold, color: C.forest, border: 0, fontWeight: 800, padding: "10px 26px", borderRadius: 10, cursor: "pointer" }}>Refine</button>
      </form>

      <h2 style={{ fontFamily: serif, fontSize: "1.7rem", borderBottom: `2px solid ${C.gold}`, display: "inline-block", paddingBottom: 4 }}>Goods</h2>
      {products.length === 0 && <p style={{ color: C.muted, fontStyle: "italic" }}>Nothing matches — try broadening your search.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, marginTop: 16 }}>
        {products.map((p) => (
          <article key={p.id} style={card}>
            <div style={{ height: 150, background: `linear-gradient(135deg, ${C.forest}, ${C.green})`, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontSize: "4rem" }}>
              {initial(p.title)}
            </div>
            <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
              <p style={vendor}>{p.vendor} · {p.city}</p>
              <h3 style={{ fontFamily: serif, fontSize: "1.15rem", margin: "6px 0" }}>{p.title}</h3>
              <p style={price}>{formatNGN(p.priceNGN)}</p>
              <p style={{ color: p.stock > 0 ? C.green : "#B3261E", fontSize: ".9rem", margin: "4px 0 0" }}>{p.stock > 0 ? `In stock (${p.stock})` : "Out of stock"}</p>
            </div>
          </article>
        ))}
      </div>

      <h2 style={{ fontFamily: serif, fontSize: "1.7rem", borderBottom: `2px solid ${C.gold}`, display: "inline-block", paddingBottom: 4, marginTop: 48 }}>Services</h2>
      {services.length === 0 && <p style={{ color: C.muted, fontStyle: "italic" }}>No services match.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, marginTop: 16 }}>
        {services.map((s) => (
          <article key={s.id} style={card}>
            <div style={{ padding: 20 }}>
              <p style={vendor}>{s.vendor} · {s.city}</p>
              <h3 style={{ fontFamily: serif, fontSize: "1.15rem", margin: "6px 0" }}>{s.title}</h3>
              <p style={price}>{formatNGN(s.priceNGN)} <span style={{ fontSize: ".9rem", color: C.muted, fontFamily: "system-ui" }}>· {s.durationMin} min</span></p>
              <Link href={`/book/${s.id}`} style={btn}>Reserve a slot</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
