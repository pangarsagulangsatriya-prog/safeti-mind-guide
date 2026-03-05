import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  placeholder,
  disabled = false,
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync draft when selected changes externally
  useEffect(() => { setDraft(selected); }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDraft(selected); // revert on outside click
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected]);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    setDraft(prev =>
      prev.includes(option) ? prev.filter(s => s !== option) : [...prev, option]
    );
  };

  const handleApply = () => {
    onChange(draft);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCancel = () => {
    setDraft(selected);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClearAll = () => {
    setDraft([]);
  };

  const displayValue = selected.length === 0
    ? `${label}: Semua`
    : `${label}: ${selected.length} dipilih`;

  const hasChanges = JSON.stringify(draft.sort()) !== JSON.stringify([...selected].sort());

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => { if (!disabled) { setIsOpen(!isOpen); setDraft(selected); } }}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-sm transition-colors whitespace-nowrap",
          "bg-background hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          selected.length > 0
            ? "border-primary/40 text-foreground"
            : "border-input text-muted-foreground",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-ring ring-offset-1"
        )}
      >
        <span className="truncate max-w-[140px]">{displayValue}</span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 min-w-[260px] bg-popover border border-border rounded-lg shadow-lg shadow-black/8 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
            <span className="text-xs font-semibold text-foreground">{label}</span>
            <div className="flex items-center gap-2">
              {draft.length > 0 && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full tabular-nums">
                  {draft.length} dipilih
                </span>
              )}
              {draft.length > 0 && (
                <button type="button" onClick={handleClearAll} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="px-2.5 py-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <Input
                placeholder={`Cari ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs bg-muted/30 border-border/60"
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                Tidak ditemukan
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isChecked = draft.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-xs transition-colors",
                      "hover:bg-muted/50",
                      isChecked && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center transition-colors",
                      isChecked
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    )}>
                      {isChecked && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                    </div>
                    <span className="flex-1 truncate text-foreground">{option}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-border bg-muted/20">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel} className="h-7 px-3 text-xs text-muted-foreground">
              Batal
            </Button>
            <Button type="button" size="sm" onClick={handleApply} className="h-7 px-4 text-xs" disabled={!hasChanges && draft.length === selected.length}>
              Terapkan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;