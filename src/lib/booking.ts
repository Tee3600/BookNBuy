// Slot guard: rely on Prisma @@unique([vendorId, startAt]) on Booking.
// Always create bookings inside a transaction and catch P2002 (unique violation)
// to return "slot taken" instead of 500.

export function toSlotRange(startAt: Date, durationMin: number, bufferMin = 0) {
  const endAt = new Date(startAt.getTime() + (durationMin + bufferMin) * 60000);
  return { startAt, endAt };
}
