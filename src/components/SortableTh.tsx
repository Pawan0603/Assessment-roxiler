"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface Props<K extends string> {
  field: K;
  label: string;
  sort: { field: K; dir: "asc" | "desc" };
  onSort: (f: K) => void;
}

export function SortableTh<K extends string>({
  field,
  label,
  sort,
  onSort,
}: Props<K>) {
  const active = sort.field === field;

  return (
    <th
      onClick={() => onSort(field)}
      className="cursor-pointer select-none px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {!active && <ArrowUpDown className="h-3 w-3 opacity-50" />}
        {active && sort.dir === "asc" && <ArrowUp className="h-3 w-3" />}
        {active && sort.dir === "desc" && <ArrowDown className="h-3 w-3" />}
      </span>
    </th>
  );
}

export function useSort<K extends string>(initial: K) {
  const [sort, setSort] = useState<{ field: K; dir: "asc" | "desc" }>({
    field: initial,
    dir: "asc",
  });

  const onSort = (field: K) => {
    setSort((prev) => {
      if (prev.field === field) {
        // toggle direction
        return {
          field,
          dir: prev.dir === "asc" ? "desc" : "asc",
        };
      }
      return { field, dir: "asc" };
    });
  };

  return { sort, onSort };
}