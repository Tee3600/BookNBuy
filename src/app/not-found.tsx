import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1>Not found</h1>
      <p>That page does not exist. Start over:</p>
      <p><Link href="/">Homepage</Link> · <Link href="/catalog">Catalog</Link> · <Link href="/cart">Cart</Link></p>
    </div>
  );
}
