const USD_TO_INR = parseFloat(import.meta.env.VITE_CURRENCY_RATE ?? '83.5');

export function formatINR(usdAmount: number): string {
  const inr = Math.round(usdAmount * USD_TO_INR);
  return '₹' + inr.toLocaleString('en-IN');
}

export function inrToUsd(inr: number): number {
  return inr / USD_TO_INR;
}

export function usdToInr(usd: number): number {
  return Math.round(usd * USD_TO_INR);
}
