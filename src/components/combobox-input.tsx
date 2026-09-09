import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  id: string;
  value?: string;
  label: string;
  sublabel?: string;
}

interface ComboboxInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectOption?: (option: ComboboxOption) => void;
  options: ComboboxOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ComboboxInput({
  value,
  onChange,
  onSelectOption,
  options,
  placeholder = "Ketik atau pilih opsi...",
  className,
  disabled = false,
}: ComboboxInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on input
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(value.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(value.toLowerCase())),
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt.label);
    onSelectOption?.(opt);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-9"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-0 h-full px-2 text-muted-foreground hover:bg-transparent"
          tabIndex={-1}
        >
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {value ? `Gunakan "${value}" (input manual)` : "Tidak ada opsi yang cocok"}
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.label.toLowerCase() === value.toLowerCase();
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent/50 font-medium",
                  )}
                >
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="text-xs text-muted-foreground">{opt.sublabel}</div>
                    )}
                  </div>
                  {isSelected && <Check className="size-4 text-primary" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

