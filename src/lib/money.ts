export function formatMoney(amount: number, currency = "EUR", locale = "en-IE") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount / 100);
}

export function parseMoneyInput(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(amount) ? amount : null;
}
