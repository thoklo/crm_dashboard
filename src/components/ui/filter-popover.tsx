"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, Filter } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
  checked?: boolean;
}

interface FilterPopoverProps {
  options: FilterOption[];
  onFilterChange: (selectedOptions: string[]) => void;
  title?: string;
}

export function FilterPopover({
  options,
  onFilterChange,
  title = "Filter",
}: FilterPopoverProps) {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);

  const handleOptionToggle = (value: string) => {
    const newSelectedOptions = selectedOptions.includes(value)
      ? selectedOptions.filter((option) => option !== value)
      : [...selectedOptions, value];
    
    setSelectedOptions(newSelectedOptions);
    onFilterChange(newSelectedOptions);
  };

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild><button
          className="inline-flex ml-2 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-8 w-8"
          title={title}
          aria-label={title}
        >
          <Filter className="h-4 w-4" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          className="z-50 w-64 rounded-md border bg-white p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-zinc-900"
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{title}</p>
            <div className="flex flex-col gap-1">
              {options.map((option) => (                <label
                  key={option.value}
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent cursor-pointer"
                  onClick={() => handleOptionToggle(option.value)}
                >
                  <div className="flex h-4 w-4 items-center justify-center rounded border">
                    {selectedOptions.includes(option.value) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
