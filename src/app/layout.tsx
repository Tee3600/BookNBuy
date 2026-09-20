import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BookNBuy — Buy goods, book services",
  description: "NGN-first unified marketplace MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 0 }}>
        <header style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <strong>BookNBuy</strong> <span style={{ color: "#666" }}>MVP</span>
        </header>
        <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>{children}</main>
      </body>
    </html>
  );
}
