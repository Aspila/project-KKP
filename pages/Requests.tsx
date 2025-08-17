/**
 * Requests page: users see their own requests; admin can approve/decline with due date.
 */

import AppLayout from "../components/layout/AppLayout";
import RequireAuth from "../components/auth/RequireAuth";
import { useAuth } from "../store/auth";
import { useDB } from "../store/db";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { useState } from "react";
import ApproveDialog from "../components/requests/ApproveDialog";

export default function RequestsPage() {
  const { db, approveRequest, declineRequest } = useDB();
  const { user } = useAuth();

  const [approveState, setApproveState] = useState<{ open: boolean; id?: string }>({ open: false });

  const isAdmin = user?.role === "admin";
  const requests = db.requests
    .filter((r) => (isAdmin ? true : r.userId === user?.id))
    .map((r) => {
      const item = db.items.find((i) => i.id === r.itemId);
      const requester = db.users.find((u) => u.id === r.userId);
      return {
        ...r,
        itemName: item?.name ?? "-",
        requester: requester?.name ?? "-",
      };
    });

  const onApprove = (id: string, dueDate?: string) => {
    try {
      if (!user) return;
      approveRequest(id, user.id, dueDate);
      toast.success("Permintaan disetujui");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onDecline = (id: string) => {
    try {
      if (!user) return;
      declineRequest(id, user.id);
      toast.success("Permintaan ditolak");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <RequireAuth>
      <AppLayout>
        <div className="mb-4">
          <div className="text-xl font-semibold">Permintaan</div>
          <div className="text-sm text-muted-foreground">
            {isAdmin ? "Kelola permintaan peminjaman." : "Permintaan Anda."}
          </div>
        </div>

        <div className="rounded-lg border bg-white dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Peminta</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">{r.itemName}</TableCell>
                  <TableCell className="text-sm">{r.requester}</TableCell>
                  <TableCell className="text-sm">{r.qty}</TableCell>
                  <TableCell className="text-xs capitalize">{r.status}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(r.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && r.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => setApproveState({ open: true, id: r.id })}>
                          <Check className="h-4 w-4 mr-2" />
                          Setujui
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-transparent"
                          size="sm"
                          onClick={() => onDecline(r.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Tolak
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm py-6 text-muted-foreground">
                    Belum ada permintaan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ApproveDialog
          open={approveState.open}
          onOpenChange={(v) => setApproveState({ open: v, id: approveState.id })}
          onConfirm={(due) => {
            if (approveState.id) onApprove(approveState.id, due);
          }}
        />
      </AppLayout>
    </RequireAuth>
  );
}
