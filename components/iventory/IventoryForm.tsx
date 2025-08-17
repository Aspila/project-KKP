/**
 * InventoryForm for creating and editing Item entity using react-hook-form + zod.
 */

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { itemSchema, useDB, type Item } from "../../store/db"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"

interface InventoryFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  editItem?: Item | null
}

/** Form schema derived from itemSchema with string numbers for inputs */
const formSchema = itemSchema

type FormValues = z.infer<typeof formSchema>

/** Create/Edit item dialog form */
export default function InventoryForm({ open, onOpenChange, editItem }: InventoryFormProps) {
  const { db, addItem, updateItem, nextCode } = useDB()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      category: db.categories[0] ?? "",
      location: db.locations[0] ?? "",
      condition: "good",
      quantity: 0,
      available: 0,
      image: "",
      purchaseDate: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.reset({
          name: editItem.name,
          code: editItem.code,
          category: editItem.category,
          location: editItem.location,
          condition: editItem.condition,
          quantity: editItem.quantity,
          available: editItem.available,
          image: editItem.image,
          purchaseDate: editItem.purchaseDate,
          notes: editItem.notes,
        })
      } else {
        form.reset({
          name: "",
          code: nextCode("itm"),
          category: db.categories[0] ?? "",
          location: db.locations[0] ?? "",
          condition: "good",
          quantity: 1,
          available: 1,
          image: "",
          purchaseDate: "",
          notes: "",
        })
      }
    }
  }, [open, editItem, form, db.categories, db.locations, nextCode])

  const onSubmit = (values: FormValues) => {
    if (editItem) {
      updateItem(editItem.id, values)
    } else {
      addItem(values)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editItem ? "Ubah Item" : "Tambah Item"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <Label htmlFor="name">Nama</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="code">Kode</Label>
            <Input id="code" {...form.register("code")} />
            {form.formState.errors.code && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.code.message}</p>
            )}
          </div>
          <div>
            <Label>Kategori</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(v) => form.setValue("category", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {db.categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Lokasi</Label>
            <Select
              value={form.watch("location")}
              onValueChange={(v) => form.setValue("location", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih lokasi" />
              </SelectTrigger>
              <SelectContent>
                {db.locations.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Kondisi</Label>
            <Select
              value={form.watch("condition")}
              onValueChange={(v) => form.setValue("condition", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kondisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Baik</SelectItem>
                <SelectItem value="needs_repair">Perlu Perbaikan</SelectItem>
                <SelectItem value="broken">Rusak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">Jumlah</Label>
            <Input
              id="quantity"
              type="number"
              min={0}
              {...form.register("quantity", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="available">Tersedia</Label>
            <Input
              id="available"
              type="number"
              min={0}
              {...form.register("available", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="purchaseDate">Tgl Pembelian</Label>
            <Input id="purchaseDate" type="date" {...form.register("purchaseDate")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="image">Gambar (URL)</Label>
            <Input id="image" placeholder="https://..." {...form.register("image")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit">{editItem ? "Simpan Perubahan" : "Tambah"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
