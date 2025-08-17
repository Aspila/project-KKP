/**
 * Inventory page: list, search, filter, CRUD for admin and request for user, plus CSV export.
 */

import { useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import RequireAuth from "../components/auth/RequireAuth";
import { useAuth } from "../store/auth";
import { useDB, type Item } from "../store/db";
import InventoryForm from "../components/inventory/InventoryForm";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit, ShoppingCart, Download } from "lucide-react";
import { downloadCSV } from "../lib/csv";

export default function InventoryPage() {
  const { user } = useAuth();
  const { db, deleteItem, createRequest } = useDB();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [loc, setLoc] = useState<string>("");
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [confirmDel, setConfirmDel] = useState<{ open: boolean; id?: string }>({ open: false });

  const filtered = useMemo(() => {
    return db.items.filter((i) => {
      const matchQ =
        q.length === 0 ||
        i.name.toLowerCase().includes(q.toLowerCase()) ||
        i.code.toLowerCase().includes(q.toLowerCase());
      const matchCat = !cat || i.category === cat;
      const matchLoc = !loc || i.location === loc;
      return matchQ && matchCat && matchLoc;
    });
  }, [db.items, q, cat, loc]);

  const doDelete = () => {
    if (confirmDel.id) {
      deleteItem(confirmDel.id);
      toast.success("Item dihapus");
    }
    setConfirmDel({ open: false });
  };

  const handleRequest = async (item: Item) => {
    try {
      if (!user) return;
      const qty = 1;
      await createRequest({ itemId: item.id, userId: user.id, qty });
      toast.success("Permintaan diajukan");
    } catch (e: any) {
      toast.error(e.message || "Gagal mengajukan");
    }
  };

  const exportCSV = () => {
    const data = filtered.map((i) => ({
      name: i.name,
      code: i.code,
      category: i.category,
      location: i.location,
      condition: i.condition,
      quantity: i.quantity,
      available: i.available,
      updatedAt: new Date(i.updatedAt).toLocaleString(),
    }));
    downloadCSV("inventaris.csv", data);
  };

  return (
    <RequireAuth>
      <AppLayout>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xl font-semibold">Inventaris</div>
            <div className="text-sm text-muted-foreground">
              Kelola item dan stok ketersediaan.
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={exportCSV}
              title="Ekspor daftar (berdasarkan filter)"
            >
              <Download className="mr-2 h-4 w-4" />
              Ekspor CSV
            </Button>
            {user?.role === "admin" && (
              <Button
                onClick={() => {
                  setEditItem(null);
                  setOpenForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Item
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 w-72"
              placeholder="Cari nama atau kode..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Kategori:</span>
            <div className="flex gap-1 flex-wrap">
              <Badge
                variant={cat === "" ? "default" : "outline"}
                className={cat === "" ? "" : "bg-transparent cursor-pointer"}
                onClick={() => setCat("")}
              >
                Semua
              </Badge>
              {db.categories.map((c) => (
                <Badge
                  key={c}
                  variant={cat === c ? "default" : "outline"}
                  className={cat === c ? "" : "bg-transparent cursor-pointer"}
                  onClick={() => setCat(c)}
                >
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Lokasi:</span>
            <div className="flex gap-1 flex-wrap">
              <Badge
                variant={loc === "" ? "default" : "outline"}
                className={loc === "" ? "" : "bg-transparent cursor-pointer"}
                onClick={() => setLoc("")}
              >
                Semua
              </Badge>
              {db.locations.map((l) => (
                <Badge
                  key={l}
                  variant={loc === l ? "default" : "outline"}
                  className={loc === l ? "" : "bg-transparent cursor-pointer"}
                  onClick={() => setLoc(l)}
                >
                  {l}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead className="text-right">Tersedia/Jumlah</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="flex items-center gap-2">
                    <img
                      src={
                        i.image ||
                        "https://pub-cdn.sider.ai/u/U024HZ4WEKZ/web-coder/68a20cc638697d89a1050142/resource/ddad2e32-da8b-4f12-9b2d-559d516dda4d.jpg"
                      }
                      className="object-cover h-8 w-8 rounded"
                    />
                    <div className="font-medium">{i.name}</div>
                  </TableCell>
                  <TableCell className="text-xs">{i.code}</TableCell>
                  <TableCell className="text-xs">{i.category}</TableCell>
                  <TableCell className="text-xs">{i.location}</TableCell>
                  <TableCell className="text-xs">
                    {i.condition === "good" && <Badge>Baik</Badge>}
                    {i.condition === "needs_repair" && <Badge variant="secondary">Perlu Perbaikan</Badge>}
                    {i.condition === "broken" && <Badge variant="destructive">Rusak</Badge>}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {i.available}/{i.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {user?.role === "admin" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="bg-transparent"
                          size="sm"
                          onClick={() => {
                            setEditItem(i);
                            setOpenForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-transparent"
                          size="sm"
                          onClick={() => setConfirmDel({ open: true, id: i.id })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        disabled={i.available < 1}
                        onClick={() => handleRequest(i)}
                        title={i.available < 1 ? "Stok habis" : "Ajukan peminjaman"}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Minta
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm py-6 text-muted-foreground">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <InventoryForm open={openForm} onOpenChange={setOpenForm} editItem={editItem || undefined} />
        <ConfirmDialog
          open={confirmDel.open}
          onOpenChange={(v) => setConfirmDel({ open: v, id: confirmDel.id })}
          title="Hapus Item?"
          description="Tindakan ini tidak dapat dibatalkan."
          onConfirm={doDelete}
        />
      </AppLayout>
    </RequireAuth>
  );
}
