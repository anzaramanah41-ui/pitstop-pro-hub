import { cn } from "@/lib/utils";
import type { StatusServis, StatusBooking } from "@/lib/store";

const styles: Record<StatusServis, string> = {
  Booking: "bg-muted text-muted-foreground ring-border",
  Menunggu: "bg-warning/15 text-warning-foreground ring-warning/40",
  Diproses: "bg-primary/10 text-primary ring-primary/30",
  Selesai: "bg-success/12 text-success ring-success/35",
  "Menunggu Pembayaran": "bg-warning/15 text-warning-foreground ring-warning/40",
  "Selesai Dibayar": "bg-success/12 text-success ring-success/35",
};

const bookingStyles: Record<StatusBooking, string> = {
  "Menunggu Konfirmasi": "bg-warning/15 text-warning-foreground ring-warning/40",
  Diterima: "bg-success/12 text-success ring-success/35",
  Ditolak: "bg-destructive/10 text-destructive ring-destructive/30",
};

const base =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset";

export function StatusBadge({ status }: { status: StatusServis }) {
  return (
    <span className={cn(base, styles[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function BookingBadge({ status }: { status: StatusBooking }) {
  return (
    <span className={cn(base, bookingStyles[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
