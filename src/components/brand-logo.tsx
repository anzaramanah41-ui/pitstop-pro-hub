import mark from "@/assets/pitstop-mark.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1", className)}
      style={{ width: size, height: size }}
    >
      <img src={mark.url} alt="Logo Bengkel Pitstop" className="h-full w-full object-contain" />
    </span>
  );
}
