import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null, symbol = "Bs.") {
  const n = Number(value ?? 0);
  return `${symbol} ${n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: number | string | null, decimals = 4) {
  const n = Number(value ?? 0);
  return n.toLocaleString("es-VE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
