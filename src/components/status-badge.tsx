import { cn } from "@/lib/utils";
import type { StatusServis } from "@/lib/store";

const styles: Record<StatusServis, string> = {
  Menunggu: "bg-warning/15 text-warning-foreground ring-warning/40",
  Diproses: "bg-primary/10 text-primary ring-primary/30",
  Selesai: "bg-success/12 text-success ring-success/35",
};

export function StatusBadge({ status }: { status: StatusServis }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        styles[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
