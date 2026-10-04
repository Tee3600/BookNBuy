import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BookNBuy — Buy goods, book services",
  description: "NGN-first unified marketplace prototype (Phases 0-2)"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 0, background: "#F6F7F4", color: "#14201A" }}>
        <header style={{ padding: 16, background: "#14201A", color: "#fff" }}>
          <strong>BookNBuy</strong> <span style={{ opacity: 0.7 }}>prototype · Phases 0–6</span>
        </header>
        <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>{children}</main>
        <style>{`
          label { display: block; font-weight: 600; margin: 12px 0 6px; }
          input { width: 100%; padding: 12px 14px; font-size: 1rem; border: 2px solid #E2E8E2; border-radius: 12px; }
          select { padding: 12px 14px; font-size: 1rem; border: 2px solid #E2E8E2; border-radius: 12px; background: #fff; }
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
