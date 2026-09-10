import appbenkLogo from "@/assets/appbenk-logo.png";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
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
    </span>
  );
}
