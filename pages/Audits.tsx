/**
 * Audits page - admin-only view of system activity logs (audits).
 */

import AppLayout from "../components/layout/AppLayout";
import RequireAuth from "../components/auth/RequireAuth";
import { useDB } from "../store/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { downloadCSV } from "../lib/csv";
import { useMemo } from "react";

/** Admin page that lists all audit events with export option */
export default function AuditsPage() {
  const { db } = useDB();

  const rows = useMemo(() => {
    return [...db.audits].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [db.audits]);

  const handleExport = () => {
    const data = rows.map((r) => ({
      createdAt: new Date(r.createdAt).toLocaleString(),
      action: r.action,
      userId: r.userId ?? "",
      targetId: r.targetId ?? "",
      payload: r.payload ? JSON.stringify(r.payload) : "",
    }));
    downloadCSV("audits.csv", data);
  };

  return (
    <RequireAuth role="admin">
      <AppLayout>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xl font-semibold">Aktivitas</div>
            <div className="text-sm text-muted-foreground">
              Riwayat aksi sistem untuk audit dan pelacakan.
            </div>
          </div>
          <Button variant="outline" className="bg-transparent" onClick={handleExport}>
            Ekspor CSV
          </Button>
        </div>

        <div className="rounded-lg border bg-white dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs">{new Date(a.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{a.action}</TableCell>
                  <TableCell className="text-xs">{a.userId || "-"}</TableCell>
                  <TableCell className="text-xs">{a.targetId || "-"}</TableCell>
                  <TableCell className="text-xs">
                    {a.payload ? JSON.stringify(a.payload) : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm py-6 text-muted-foreground">
                    Belum ada aktivitas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </AppLayout>
    </RequireAuth>
  );
}
