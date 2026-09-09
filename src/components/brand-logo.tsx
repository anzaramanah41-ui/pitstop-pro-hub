<<<<<<< HEAD
import mark from "@/assets/pitstop-mark.png.asset.json";
=======
import appbenkLogo from "@/assets/appbenk-logo.png";
>>>>>>> b897868 (Initial commit - AppBenk)
import { cn } from "@/lib/utils";

export function BrandLogo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
<<<<<<< HEAD
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1", className)}
      style={{ width: size, height: size }}
    >
      <img src={mark.url} alt="Logo Bengkel Pitstop" className="h-full w-full object-contain" />
=======
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1 shadow-sm",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={appbenkLogo || "/favicon.png"}
        alt="Logo AppBenk"
        className="h-full w-full object-contain"
      />
>>>>>>> b897868 (Initial commit - AppBenk)
    </span>
  );
}
