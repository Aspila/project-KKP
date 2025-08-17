/**
 * Profile page: show current user information and simple edits.
 */

import AppLayout from "../components/layout/AppLayout"
import RequireAuth from "../components/auth/RequireAuth"
import { useAuth } from "../store/auth"
import { useDB } from "../store/db"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user } = useAuth()
  const { updateUser } = useDB()

  if (!user) return null

  const save = (field: "name" | "email" | "password" | "avatarUrl", value: string) => {
    updateUser(user.id, { [field]: value })
    toast.success("Profil diperbarui")
  }

  return (
    <RequireAuth>
      <AppLayout>
        <div className="max-w-2xl space-y-4">
          <div>
            <div className="text-xl font-semibold">Profil</div>
            <div className="text-sm text-muted-foreground">
              Kelola informasi akun Anda.
            </div>
          </div>

          <div className="rounded-lg border bg-white dark:bg-neutral-900 dark:border-neutral-800 p-4 space-y-3">
            <div>
              <Label>Nama</Label>
              <div className="flex gap-2">
                <Input defaultValue={user.name} onBlur={(e) => save("name", e.target.value)} />
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement)
                    save("name", input.value)
                  }}
                >
                  Simpan
                </Button>
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="flex gap-2">
                <Input defaultValue={user.email} onBlur={(e) => save("email", e.target.value)} />
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement)
                    save("email", input.value)
                  }}
                >
                  Simpan
                </Button>
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="Ganti password" onBlur={(e) => save("password", e.target.value)} />
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement)
                    save("password", input.value)
                  }}
                >
                  Simpan
                </Button>
              </div>
            </div>
            <div>
              <Label>Avatar URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  defaultValue={user.avatarUrl}
                  onBlur={(e) => save("avatarUrl", e.target.value)}
                />
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement)
                    save("avatarUrl", input.value)
                  }}
                >
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </RequireAuth>
  )
}
