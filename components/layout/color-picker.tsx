"use client";

import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useTheme } from "next-themes";

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Normalize hex (#rgb or #rrggbb)
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function isLightFromHsl({ l }: { h: number; s: number; l: number }) {
  return l >= 60; // simple threshold for contrast
}

function applyPrimary(hex: string) {
  const root = document.documentElement;
  const hsl = hexToHsl(hex);
  const hslStr = `${hsl.h} ${hsl.s}% ${hsl.l}%`;

  // Apply to light root
  root.style.setProperty("--primary", hslStr);
  root.style.setProperty("--ring", hslStr);
  root.style.setProperty(
    "--primary-foreground",
    isLightFromHsl(hsl) ? "20 14.3% 4.1%" : "60 9.1% 97.8%"
  );
  // Keep accent in sync with primary for a unified brand color
  root.style.setProperty("--accent", hslStr);
  root.style.setProperty(
    "--accent-foreground",
    isLightFromHsl(hsl) ? "20 14.3% 4.1%" : "60 9.1% 97.8%"
  );

  // Also set on .dark scope by toggling a data attr to store custom value
  const dark = document.querySelector(".dark") as HTMLElement | null;
  if (dark) {
    dark.style.setProperty("--primary", hslStr);
    dark.style.setProperty("--ring", hslStr);
    dark.style.setProperty(
      "--primary-foreground",
      isLightFromHsl(hsl) ? "20 14.3% 4.1%" : "60 9.1% 97.8%"
    );
    dark.style.setProperty("--accent", hslStr);
    dark.style.setProperty(
      "--accent-foreground",
      isLightFromHsl(hsl) ? "20 14.3% 4.1%" : "60 9.1% 97.8%"
    );
  }
}

export function ColorPicker() {
  const [color, setColor] = React.useState("#f97316"); // tailwind orange-500 as default
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("custom-primary-hex") : null;
    if (stored) {
      setColor(stored);
      // defer apply until after state set
      requestAnimationFrame(() => applyPrimary(stored));
    }
  }, []);

  // Re-apply when theme toggles (ensures .dark scope gets updated)
  React.useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("custom-primary-hex") : null;
    if (stored) {
      requestAnimationFrame(() => applyPrimary(stored));
    }
  }, [resolvedTheme]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setColor(hex);
    applyPrimary(hex);
    try {
      localStorage.setItem("custom-primary-hex", hex);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="accent-color" className="text-sm text-muted-foreground">
        Accent
      </Label>
      <Input
        id="accent-color"
        type="color"
        value={color}
        onChange={onChange}
        className="h-8 w-10 p-0 border-0 bg-transparent"
        aria-label="Pick accent color"
      />
    </div>
  );
}
