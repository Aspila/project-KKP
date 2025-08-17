/**
 * Route guard component to protect private routes based on auth state.
 * Redirects to /login when user is not authenticated.
 */

import { ReactNode, useEffect } from "react"
import { useAuth } from "../../store/auth"
import { useLocation, useNavigate } from "react-router"

interface RequireAuthProps {
  children: ReactNode
  role?: "admin" | "user"
}

/** Protects children. If role specified, ensures user has proper role. */
export default function RequireAuth({ children, role }: RequireAuthProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true })
      return
    }
    if (role && user.role !== role) {
      // If role not matched, send to Home
      navigate("/", { replace: true })
      return
    }
  }, [user, role, navigate, location])

  if (!user) return null
  if (role && user.role !== role) return null
  return <>{children}</>
}
