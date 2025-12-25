import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Pilih...",
  disabled = false,
  compact = false
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const selectAll = () => {
    onChange(filteredOptions);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-between text-left font-normal",
          compact ? "h-8 px-2 text-xs" : "h-9 px-3",
          disabled && "opacity-50 cursor-not-allowed",
          selected.length > 0 && "border-primary/50"
        )}
        disabled={disabled}
      >
        <span className="flex items-center gap-1.5 truncate">
          <span className={cn("truncate", compact ? "text-xs" : "text-sm")}>
            {selected.length === 0 ? placeholder : label}
          </span>
          {selected.length > 0 && (
            <Badge variant="secondary" className={cn(
              "px-1.5 bg-primary/10 text-primary",
              compact ? "h-4 text-[10px]" : "h-5 text-xs"
            )}>
              {selected.length}
            </Badge>
          )}
        </span>
        <ChevronDown className={cn(
          "shrink-0 text-muted-foreground transition-transform",
          compact ? "w-3 h-3" : "w-4 h-4",
          isOpen && "rotate-180"
        )} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] bg-popover border border-border rounded-md shadow-lg">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted/30">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-primary hover:underline"
            >
              Pilih Semua
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Hapus Semua
            </button>
          </div>

          {/* Options List */}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Tidak ada hasil
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleOption(option)}
                  className={cn(
                    "w-full flex items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors",
                    selected.includes(option) && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 shrink-0 mt-0.5 rounded border flex items-center justify-center",
                    selected.includes(option) 
                      ? "bg-primary border-primary" 
                      : "border-muted-foreground/30"
                  )}>
                    {selected.includes(option) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="flex-1 break-words text-foreground">{option}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
