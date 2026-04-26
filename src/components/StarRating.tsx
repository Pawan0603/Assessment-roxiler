"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, size = 20, readOnly }: Props) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(n)}
          className={`transition-transform ${
            readOnly
              ? "cursor-default"
              : "cursor-pointer hover:scale-110"
          }`}
          aria-label={`${n} star`}
        >
          <Star
            style={{ width: size, height: size }}
            className={
              n <= display
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/40"
            }
          />
        </button>
      ))}
    </div>
  );
}