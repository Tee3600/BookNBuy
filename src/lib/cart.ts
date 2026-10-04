// Client cart helpers (localStorage).  next lint: keep route files
// to a single default export — helpers live here.
export type CartItem = { kind: "PRODUCT" | "BOOKING"; refId: string; title: string; priceNGN: number; qty: number };
const KEY = "bbn-cart";

export function loadCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}
export function addToCart(item: CartItem) {
  const cart = loadCart();
  const same = cart.find((c) => c.kind === item.kind && c.refId === item.refId);
  if (same) same.qty += item.qty;
  else cart.push(item);
  saveCart(cart);
}
