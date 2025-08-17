/**
 * AuditListCompact - compact list to display recent audit activities.
 */

import { useDB } from "../../store/db";

/** Props for compact audit list */
interface AuditListCompactProps {
  /** Maximum number of entries to show */
  limit?: number;
}

/**
 * Renders last N audits with minimal styling.
 */
export default function AuditListCompact({ limit = 5 }: AuditListCompactProps) {
  const { db } = useDB();
  const items = [...db.audits]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);

  return (
    <div className="rounded-lg border p-4 bg-white dark:bg-neutral-900 dark:border-neutral-800">
      <div className="text-lg font-semibold mb-2">Aktivitas Terbaru</div>
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">Belum ada aktivitas.</div>
        )}
        {items.map((a) => (
          <div key={a.id} className="text-sm flex items-start gap-2">
            <span className="text-muted-foreground shrink-0">
              {new Date(a.createdAt).toLocaleTimeString()}
            </span>
            <span className="font-medium">{a.action}</span>
            <span className="text-muted-foreground">
              {a.userId ? ` • oleh ${a.userId}` : ""}
              {a.targetId ? ` • target ${a.targetId}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
