import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Input angka yang diketik manual (tanpa panah spinner).
 * Hanya menerima digit, tidak menerima huruf maupun nilai negatif.
 */
export function NumberInput({
  value,
  onChange,
  className,
  placeholder,
  min = 0,
  max,
  "aria-label": ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  "aria-label"?: string;
}) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={cn(className)}
      value={String(value)}
      onChange={(e) => {
        const bersih = e.target.value.replace(/[^0-9]/g, "");
        const angka = bersih === "" ? min : Number(bersih);
        if (!Number.isFinite(angka)) return;
        onChange(max !== undefined ? Math.min(max, Math.max(min, angka)) : Math.max(min, angka));
      }}
      onBlur={(e) => {
        if (e.target.value === "") onChange(min);
      }}
    />
  );
}
