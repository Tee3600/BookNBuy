"use client";
import { useMemo, useState } from "react";

function slotsFor(date: string, durationMin = 60) {
  if (!date) return [];
  const out: string[] = [];
  for (let h = 9; h <= 16; h++) out.push(`${date}T${String(h).padStart(2, "0")}:00:00`);
  return out;
}

export default function BookPage({ params }: { params: { serviceId: string } }) {
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState("");
  const [msg, setMsg] = useState("");
  const slots = useMemo(() => slotsFor(date), [date]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) { setMsg("Pick a time slot first."); return; }
    setMsg("Booking…");
    const res = await fetch("/api/bookings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: params.serviceId, buyerEmail: email, startAt: new Date(slot).toISOString() }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Booked (${data.bookingId}, mode: ${data.mode}).` : `Error: ${data.error}`);
  }

  return (
    <div>
      <h1>Book service {params.serviceId}</h1>
      <form onSubmit={submit}>
        <label htmlFor="email">Your account email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="date">Date</label>
        <input id="date" type="date" required value={date} onChange={(e) => { setDate(e.target.value); setSlot(""); }} />
        <p>{slots.map((s) => (
          <label key={s} style={{ display: "inline-block", marginRight: 8 }}>
            <input type="radio" name="slot" checked={slot === s} onChange={() => setSlot(s)} /> {s.slice(11, 16)}
          </label>
        ))}</p>
        <p><button className="btn btn-primary" type="submit">Confirm booking</button></p>
      </form>
      <p>{msg}</p>
    </div>
  );
}
