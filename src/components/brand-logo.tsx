import logo from "@/assets/appbenk-logo.jpg.asset.json";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white", className)}
      style={{ width: size, height: size }}
    >
      <img
        src={logo.url}
        alt="Logo Bengkel Pitstop"
        className="h-full w-full scale-[1.85] object-cover object-[52%_30%]"
      />
    </span>
  );
}
