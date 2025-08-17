/**
 * CSV utilities: convert arrays to CSV and trigger file download.
 */

export interface CSVRow {
  /** A generic string index for values */
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Convert an array of objects to a CSV string.
 * - Keys of the first row determine the header order.
 */
export function toCSV(rows: CSVRow[], delimiter = ","): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    // Quote if it contains special characters
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    headers.join(delimiter),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(delimiter)),
  ];
  return lines.join("\n");
}

/**
 * Trigger a CSV download in the browser with the given filename.
 */
export function downloadCSV(filename: string, rows: CSVRow[]) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
