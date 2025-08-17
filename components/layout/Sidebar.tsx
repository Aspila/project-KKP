/**
 * Sidebar component for app navigation with role-based menu items.
 */

import { Link, useLocation } from "react-router";
import { cn } from "../../lib/utils";
import { useAuth } from "../../store/auth";
import { Boxes, ClipboardList, Home, Send, Users, PackageOpen, User, History } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: JSX.Element;
  roles?: Array<"admin" | "user">;
}

/** Sidebar shows general and role-specific navigation links */
export default function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const menu: NavItem[] = [
    { to: "/", label: "Dashboard", icon: <Home size={18} /> },
    { to: "/inventory", label: "Inventaris", icon: <Boxes size={18} /> },
    { to: "/loans", label: "Peminjaman", icon: <ClipboardList size={18} /> },
    { to: "/requests", label: "Permintaan", icon: <Send size={18} />, roles: ["admin", "user"] },
    { to: "/audits", label: "Aktivitas", icon: <History size={18} />, roles: ["admin"] },
    { to: "/users", label: "Pengguna", icon: <Users size={18} />, roles: ["admin"] },
    { to: "/profile", label: "Profil", icon: <User size={18} /> },
  ];

  return (
    <aside className="h-full w-60 border-r bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/70 dark:border-neutral-800">
      <div className="px-4 py-4 flex items-center gap-2">
        <PackageOpen className="text-primary" />
        <div>
          <div className="font-semibold leading-tight">Inventaris Kantor</div>
          <div className="text-xs text-muted-foreground">
            {user?.role === "admin" ? "Admin" : "User"}
          </div>
        </div>
      </div>
      <nav className="px-2 py-2">
        {menu
          .filter((m) => !m.roles || m.roles.includes(user?.role ?? "user"))
          .map((m) => {
            const active = pathname === m.to;
            return (
              <Link
                key={m.to}
                to={m.to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                  active
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
              >
                {m.icon}
                <span>{m.label}</span>
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
