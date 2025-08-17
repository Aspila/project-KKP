/**
 * AppLayout wraps protected pages with Sidebar and Topbar.
 * Provides consistent shell and user menu.
 */

import { ReactNode } from "react"
import Sidebar from "./Sidebar"
import { useAuth } from "../../store/auth"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface AppLayoutProps {
  children: ReactNode
}

/** Layout shell with sidebar and top bar */
export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="h-screen w-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-4 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/70 dark:border-neutral-800">
          <div className="font-medium">Selamat datang, {user?.name}</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-transparent"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" className="bg-transparent" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 bg-neutral-50 dark:bg-neutral-950">
          {children}
        </main>
      </div>
    </div>
  )
}
