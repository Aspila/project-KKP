/**
 * Auth store for simple username/password login with role-based user session.
 * Uses users from DB store for validation.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useDB, type User } from "./db"

/** Auth state and actions */
interface AuthStore {
  user: User | null
  login: (username: string, password: string) => Promise<User>
  logout: () => void
}

/**
 * Lightweight auth store persisted to localStorage.
 * NOTE: Passwords are plain text for demo. Replace with secure backend in production.
 */
export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,

      login: async (username, password) => {
        const { db } = useDB.getState()
        const found = db.users.find((u) => u.username === username && u.password === password)
        if (!found) {
          throw new Error("Username atau password salah")
        }
        set({ user: found })
        return found
      },

      logout: () => {
        set({ user: null })
      },
    }),
    {
      name: "office-inventory-auth",
      version: 1,
    }
  )
)
