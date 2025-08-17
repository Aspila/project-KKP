/**
 * ApproveDialog - dialog for admin to set due date when approving a request.
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

interface ApproveDialogProps {
  /** Open state */
  open: boolean;
  /** Change open state */
  onOpenChange: (v: boolean) => void;
  /** Callback on confirm with optional due date (YYYY-MM-DD) */
  onConfirm: (dueDate?: string) => void;
  /** Optional default due date */
  defaultDueDate?: string;
}

/**
 * Simple dialog where admin can pick a due date. If left empty, no due date is set.
 */
export default function ApproveDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultDueDate,
}: ApproveDialogProps) {
  const [dueDate, setDueDate] = useState<string>(defaultDueDate || "");

  useEffect(() => {
    if (open) {
      setDueDate(defaultDueDate || "");
    }
  }, [open, defaultDueDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tetapkan Jatuh Tempo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="dueDate">Tanggal Jatuh Tempo (opsional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                onConfirm(dueDate || undefined);
                onOpenChange(false);
              }}
            >
              Setujui
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
