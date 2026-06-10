"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  getProductColor,
  getProductColorLabel,
  PRODUCT_COLORS,
  type ProductColor,
} from "@/lib/productColors";
import ColorSwatch from "@/components/ColorSwatch";

export type ColorSelectOption = {
  key: string;
  label: string;
  hex?: string;
};

type ColorSelectProps = {
  value: string;
  onChange: (colorKey: string) => void;
  usedKeys?: string[];
  placeholder?: string;
  className?: string;
  /** When set, only these colors are shown (for variant picker on product page). */
  options?: ColorSelectOption[];
};

function ColorOptionRow({
  color,
  label,
  disabled,
}: {
  color?: ProductColor;
  label: string;
  disabled?: boolean;
}) {
  return (
    <span className={`flex items-center gap-2 ${disabled ? "opacity-40" : ""}`}>
      <ColorSwatch colorKey={color?.key} hex={color?.hex} />
      <span className="text-sm text-slate-800">{label}</span>
    </span>
  );
}

export default function ColorSelect({
  value,
  onChange,
  usedKeys = [],
  placeholder = "Odaberi boju",
  className = "",
  options,
}: ColorSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedColor = getProductColor(value);
  const selectedLabel =
    options?.find((o) => o.key === value)?.label ??
    selectedColor?.name ??
    (value ? getProductColorLabel(value) : "");

  const catalogOptions: ColorSelectOption[] = options ?? PRODUCT_COLORS.map((c) => ({
    key: c.key,
    label: c.name,
    hex: c.hex,
  }));

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (key: string, disabled: boolean) => {
    if (disabled) return;
    onChange(key);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        id={`${listId}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${listId}-listbox`}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {value ? (
          <ColorOptionRow color={selectedColor} label={selectedLabel} />
        ) : (
          <span className="text-slate-500">{placeholder}</span>
        )}
        <span className="text-slate-400" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul
          id={`${listId}-listbox`}
          role="listbox"
          aria-labelledby={`${listId}-trigger`}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {catalogOptions.map((option) => {
            const color = getProductColor(option.key);
            const isUsedElsewhere = usedKeys.includes(option.key) && option.key !== value;
            const isSelected = option.key === value;

            return (
              <li key={option.key} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  disabled={isUsedElsewhere}
                  onClick={() => handleSelect(option.key, isUsedElsewhere)}
                  className={`flex w-full items-center px-3 py-2 text-left hover:bg-slate-50 disabled:cursor-not-allowed ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                >
                  <ColorOptionRow
                    color={
                      color ??
                      (option.hex
                        ? {
                            key: option.key,
                            name: option.label,
                            hex: option.hex,
                            swatchBackground: { backgroundColor: option.hex },
                          }
                        : undefined)
                    }
                    label={option.label}
                    disabled={isUsedElsewhere}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
