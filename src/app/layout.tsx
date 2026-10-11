import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BookNBuy — Buy goods, book services",
  description: "NGN-first unified marketplace prototype (Phases 0-6)"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 0, background: "#FDF8EE", color: "#14201A" }}>
        <header style={{ padding: "14px 20px", background: "#0A2E1F", color: "#fff", display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/" style={{ color: "#F5A623", fontWeight: 800, textDecoration: "none", fontSize: "1.1rem" }}>BookNBuy</Link>
          <nav style={{ display: "flex", gap: 16, marginLeft: "auto", fontSize: ".95rem" }}>
            <Link href="/catalog" style={{ color: "#fff" }}>Catalog</Link>
            <Link href="/vendor/onboard" style={{ color: "#fff" }}>Sell</Link>
            <Link href="/login" style={{ color: "#fff" }}>Log in</Link>
          </nav>
        </header>
        <main style={{ padding: 24, maxWidth: 1080, margin: "0 auto" }}>{children}</main>
        <style>{`
          label { display: block; font-weight: 600; margin: 12px 0 6px; }
          input { width: 100%; padding: 12px 14px; font-size: 1rem; border: 2px solid #E2E8E2; border-radius: 12px; }
          input:focus { outline: none; border-color: #0E7C3E; box-shadow: 0 0 0 3px rgba(14,124,62,.2); }
          .btn { display: inline-block; border: 0; cursor: pointer; font-size: 1rem; font-weight: 700; padding: 12px 22px; border-radius: 12px; }
          .btn-primary { background: #0E7C3E; color: #fff; }
          .btn-primary:hover { background: #0A5E30; }
          .btn-primary:focus-visible { outline: 3px solid #F5A623; outline-offset: 2px; }
          @media (max-width: 480px) { .btn { width: 100%; } }
        `}</style>
      </body>
    </html>
  );
}
