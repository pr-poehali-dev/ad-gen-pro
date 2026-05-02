import React from "react";

export function FilterChip({ active, onClick, children, color }: {
  active: boolean; onClick: () => void; children: React.ReactNode; color?: string;
}) {
  const baseColor = color || "hsl(185,100%,55%)";
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
        active ? "text-foreground" : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
      }`}
      style={active ? { borderColor: baseColor, background: `${baseColor}15`, color: baseColor } : undefined}>
      {children}
    </button>
  );
}

export function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted/20 rounded-lg p-2">
      <div className="text-sm font-heading font-bold text-foreground">{value}</div>
      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</div>
    </div>
  );
}
