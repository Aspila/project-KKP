/**
 * Users page: admin-only CRUD for application users.
 */

import AppLayout from "../components/layout/AppLayout"
import RequireAuth from "../components/auth/RequireAuth"
import { useDB, userSchema, type User } from "../store/db"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Edit, Plus, Trash2 } from "lucide-react"
import ConfirmDialog from "../components/common/ConfirmDialog"
import { toast } from "sonner"

export default function UsersPage() {
  return (
    <RequireAuth role="admin">
      <AppLayout>
        <UsersInner />
      </AppLayout>
    </RequireAuth>
  )
}

/** Inner component for users table and dialog form */
function UsersInner() {
  const { db, addUser, updateUser, deleteUser } = useDB()
  const [open, setOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [confirmDel, setConfirmDel] = useState<{ open: boolean; id?: string }>({ open: false })

  type FormValues = z.infer<typeof userSchema>
  const form = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", username: "", password: "", role: "user", email: "" },
  })

  const openNew = () => {
    setEditUser(null)
    form.reset({ name: "", username: "", password: "", role: "user", email: "" })
    setOpen(true)
  }

  const openEdit = (u: User) => {
    setEditUser(u)
    form.reset({
      name: u.name,
      username: u.username,
      password: u.password,
      role: u.role,
      email: u.email,
    })
    setOpen(true)
  }

  const onSubmit = (v: FormValues) => {
    if (editUser) {
      updateUser(editUser.id, v)
      toast.success("Pengguna diperbarui")
    } else {
      addUser(v)
      toast.success("Pengguna ditambahkan")
    }
    setOpen(false)
  }

  const doDelete = () => {
    if (confirmDel.id) {
      deleteUser(confirmDel.id)
      toast.success("Pengguna dihapus")
    }
    setConfirmDel({ open: false })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xl font-semibold">Pengguna</div>
          <div className="text-sm text-muted-foreground">Kelola akun dan peran pengguna.</div>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah
        </Button>
      </div>

      <div className="rounded-lg border bg-white dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="text-sm">{u.name}</TableCell>
                <TableCell className="text-sm">{u.username}</TableCell>
                <TableCell className="text-sm">{u.email || "-"}</TableCell>
                <TableCell className="text-sm capitalize">{u.role}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      size="sm"
                      onClick={() => openEdit(u)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      size="sm"
                      onClick={() => setConfirmDel({ open: true, id: u.id })}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {db.users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm py-6 text-muted-foreground">
                  Tidak ada pengguna.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? "Ubah Pengguna" : "Tambah Pengguna"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label>Nama</Label>
              <Input {...form.register("name")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Username</Label>
                <Input {...form.register("username")} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" {...form.register("password")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input type="email" {...form.register("email")} />
              </div>
              <div>
                <Label>Peran</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(v) => form.setValue("role", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">{editUser ? "Simpan" : "Tambah"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDel.open}
        onOpenChange={(v) => setConfirmDel({ open: v, id: confirmDel.id })}
        title="Hapus Pengguna?"
        description="Tindakan ini tidak dapat dibatalkan."
        onConfirm={doDelete}
      />
    </div>
  )
}
