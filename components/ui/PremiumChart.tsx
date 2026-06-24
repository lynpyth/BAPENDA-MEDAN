"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  label: string;
  value: number;
}

interface PremiumChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PremiumChart({ data, title, subtitle, className }: PremiumChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("space-y-6", className)}>
      {(title || subtitle) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
          <div className="space-y-1">
            {subtitle && (
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none">
                {subtitle}
              </p>
            )}
            {title && (
              <h3 className="text-lg font-bold tracking-tight uppercase leading-none text-zinc-800">
                {title}
              </h3>
            )}
          </div>
        </div>
      )}

      <div className="bg-slate-50 border border-zinc-200 rounded-xl p-6 shadow-inner group">
        <div className="flex items-end justify-between gap-4 h-48 px-2 overflow-x-auto no-scrollbar">
          {data.map((item, i) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end gap-2 min-w-[50px] group/item h-full"
              >
                <div className="relative w-full flex flex-col items-center justify-end flex-1">
                  {/* ── Value Tooltip ── */}
                  <div className="absolute -top-8 px-2 py-1 bg-white rounded border border-zinc-200 shadow-md text-[10px] font-semibold text-primary opacity-0 group-hover/item:opacity-100 transition-all -translate-y-2 group-hover/item:translate-y-0 whitespace-nowrap z-10">
                    {item.value.toLocaleString("id-ID")}
                  </div>

                  {/* ── Bar ── */}
                  <div
                    className="w-8 rounded-t bg-primary transition-all duration-700 ease-out relative overflow-hidden"
                    style={{ 
                      height: `${Math.max(percentage, 2)}%`,
                      transitionDelay: `${i * 30}ms`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                </div>

                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 group-hover/item:text-primary transition-colors whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
