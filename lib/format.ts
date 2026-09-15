const nf = new Intl.NumberFormat("id-ID");

export function num(n: number): string {
  return nf.format(Math.round(n));
}

/** Rupiah ringkas: 1,85 M / 480 M / 12,3 jt — enak dibaca di layar kecil. */
export function rupiahRingkas(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `Rp ${(n / 1e12).toFixed(1).replace(".", ",")} T`;
  if (abs >= 1e9) return `Rp ${(n / 1e9).toFixed(1).replace(".", ",")} M`;
  if (abs >= 1e6) return `Rp ${(n / 1e6).toFixed(1).replace(".", ",")} jt`;
  if (abs >= 1e3) return `Rp ${(n / 1e3).toFixed(0)} rb`;
  return `Rp ${num(n)}`;
}

export function rupiah(n: number): string {
  return `Rp ${num(n)}`;
}

export function persen(n: number, digit = 0): string {
  return `${(n * 100).toFixed(digit).replace(".", ",")}%`;
}

export function km(n: number): string {
  return `${n.toFixed(1).replace(".", ",")} km`;
}
