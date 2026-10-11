import Link from "next/link";

// Marketing landing page. Palette: deep forest + NGN green + gold on cream.
const C = {
  forest: "#0A2E1F",
  green: "#0E7C3E",
  gold: "#F5A623",
  cream: "#FDF8EE",
  ink: "#14201A",
  muted: "#5C6B62",
  card: "#FFFFFF",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-block", background: C.gold, color: C.forest,
  fontWeight: 800, padding: "14px 28px", borderRadius: 14, textDecoration: "none",
};
const btnGhost: React.CSSProperties = {
  display: "inline-block", background: "transparent", color: "#fff",
  fontWeight: 700, padding: "12px 26px", borderRadius: 14, textDecoration: "none",
  border: "2px solid rgba(255,255,255,.6)",
};
const btnGreen: React.CSSProperties = {
  display: "inline-block", background: C.green, color: "#fff",
  fontWeight: 800, padding: "14px 28px", borderRadius: 14, textDecoration: "none",
};
const section: React.CSSProperties = { padding: "56px 0" };
const h2: React.CSSProperties = { fontSize: "1.9rem", letterSpacing: "-.5px", margin: "0 0 8px" };
const sub: React.CSSProperties = { color: C.muted, fontSize: "1.05rem", maxWidth: "60ch" };
const card: React.CSSProperties = {
  background: C.card, border: "1px solid #EDE3CE", borderRadius: 16, padding: 24, flex: "1 1 240px",
};

export default function LandingPage() {
  return (
    <div style={{ background: C.cream, color: C.ink, margin: "-24px -24px 0", padding: "0 24px 64px" }}>
      {/* HERO */}
      <header style={{ background: `linear-gradient(135deg, ${C.forest} 0%, #0E4A2E 60%, ${C.green} 100%)`, color: "#fff", borderRadius: "0 0 28px 28px", margin: "0 -24px", padding: "72px 24px 64px", textAlign: "center" }}>
        <p style={{ display: "inline-block", background: "rgba(245,166,35,.16)", color: C.gold, fontWeight: 700, padding: "6px 16px", borderRadius: 999, margin: 0 }}>
          NGN-first · Diaspora-ready
        </p>
        <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 3.6rem)", letterSpacing: "-1px", lineHeight: 1.1, margin: "20px auto 12px", maxWidth: "16ch" }}>
          Buy goods. Book services. <span style={{ color: C.gold }}>One account.</span>
        </h1>
        <p style={{ opacity: 0.85, fontSize: "1.15rem", maxWidth: "52ch", margin: "0 auto 28px" }}>
          Nigeria&apos;s unified marketplace — shop products and book trusted pros with escrow-protected Paystack payments.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/catalog" style={btnPrimary}>Start shopping</Link>
          <Link href="/vendor/onboard" style={btnGhost}>Become a vendor</Link>
        </div>
        <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap", marginTop: 36, opacity: 0.9 }}>
          <div><strong style={{ fontSize: "1.4rem", color: C.gold }}>72h</strong><br />escrow protection</div>
          <div><strong style={{ fontSize: "1.4rem", color: C.gold }}>₦/$/£/€</strong><br />pay your way</div>
          <div><strong style={{ fontSize: "1.4rem", color: C.gold }}>8–10%</strong><br />fair commission</div>
        </div>
      </header>

      {/* TRUST STRIP */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
        {["Escrow-held payments", "Cards · Transfer · USSD · Apple Pay", "Bike dispatch + motor-park waybills", "WhatsApp order updates"].map((t) => (
          <span key={t} style={{ background: "#fff", border: `2px solid ${C.gold}`, borderRadius: 999, padding: "8px 18px", fontWeight: 600 }}>{t}</span>
        ))}
      </div>

      {/* SHOP / BOOK */}
      <section style={section}>
        <h2 style={h2}>Two marketplaces, zero friction</h2>
        <p style={sub}>One cart for physical goods and service appointments. Pay once with Paystack.</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 20 }}>
          <div style={{ ...card, borderTop: `6px solid ${C.green}` }}>
            <h3 style={{ margin: "0 0 6px" }}>🛍️ Shop products</h3>
            <p style={{ color: C.muted }}>Ankara, aso-oke, senator sets and more from verified vendors — stock-checked, escrow-protected.</p>
            <Link href="/catalog" style={btnGreen}>Browse catalog</Link>
          </div>
          <div style={{ ...card, borderTop: `6px solid ${C.gold}` }}>
            <h3 style={{ margin: "0 0 6px" }}>📅 Book services</h3>
            <p style={{ color: C.muted }}>Tailors, salon, repairs — live slots, no double-booking, pay on confirmation.</p>
            <Link href="/catalog" style={btnGreen}>Find a pro</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...section, background: "#fff", borderRadius: 24, padding: "48px 28px", border: "1px solid #EDE3CE" }}>
        <h2 style={h2}>How BookNBuy keeps money safe</h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 20 }}>
          {[
            ["1 · Find & pay", "Check out products and bookings together. Your money goes into escrow — not the vendor's pocket."],
            ["2 · Track delivery", "Courier, bike dispatch or waybill with receipt number, plus WhatsApp updates at every step."],
            ["3 · Confirm & release", "Confirm receipt and funds release instantly — or auto-release after 72h. Dispute anytime in-window."],
          ].map(([t, d]) => (
            <div key={t} style={{ flex: "1 1 220px" }}>
              <h3 style={{ color: C.green, margin: "0 0 6px" }}>{t}</h3>
              <p style={{ color: C.muted, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VENDOR BAND */}
      <section style={{ ...section, background: C.forest, color: "#fff", borderRadius: 24, padding: "48px 28px", marginTop: 32, textAlign: "center" }}>
        <h2 style={{ ...h2, color: "#fff" }}>Sell goods <span style={{ color: C.gold }}>&</span> services from one dashboard</h2>
        <p style={{ opacity: 0.85, maxWidth: "56ch", margin: "0 auto 24px" }}>
          List products, set your booking calendar, get paid in Naira after escrow release. Diaspora customers pay in USD, GBP or EUR — you settle in NGN.
        </p>
        <Link href="/signup" style={btnPrimary}>Open your shop — free</Link>
      </section>

      {/* PERSONAS */}
      <section style={section}>
        <h2 style={h2}>Built for how Nigeria actually shops</h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 20 }}>
          {[
            ["Tobi · Lagos", "Buys tech + books home repair in one checkout with instant transfer."],
            ["Amaka · Abuja", "Runs a boutique and tailoring calendar — no double-booking, automated payouts."],
            ["Kemi · London", "Pays in GBP with Apple Pay for family back home. No rejected foreign cards."],
          ].map(([t, d]) => (
            <div key={t} style={card}>
              <strong>{t}</strong>
              <p style={{ color: C.muted, margin: "6px 0 0" }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.forest, color: "#fff", borderRadius: "24px 24px 0 0", margin: "0 -24px -64px", padding: "32px 24px", display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
        <div><strong>BookNBuy</strong> <span style={{ opacity: 0.6 }}>· Buy goods, book services</span></div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/app" style={{ color: C.gold }}>Prototype hub</Link>
          <Link href="/api/health" style={{ color: "#fff" }}>Status</Link>
        </div>
      </footer>
    </div>
  );
}
