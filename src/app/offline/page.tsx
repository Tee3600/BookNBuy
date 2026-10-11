import Link from "next/link";

export default function OfflinePage() {
  return (
    <div style={{ textAlign: "center", padding: "64px 0" }}>
      <h1 style={{ fontFamily: "Georgia, serif" }}>You&apos;re offline</h1>
      <p style={{ color: "#5C6B62" }}>BookNBuy needs a connection for catalog and checkout. Your installed app will resume automatically.</p>
      <p><Link href="/">Retry homepage</Link></p>
    </div>
  );
}
