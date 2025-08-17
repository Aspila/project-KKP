/**
 * Dashboard (Home) page with key stats, quick actions, and recent activities.
 */

import AppLayout from "../components/layout/AppLayout";
import RequireAuth from "../components/auth/RequireAuth";
import StatCard from "../components/common/StatCard";
import { useDB } from "../store/db";
import { Boxes, ClipboardList, Send, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import AuditListCompact from "../components/common/AuditListCompact";

export default function HomePage() {
  const { db } = useDB();
  const totalItems = db.items.length;
  const totalBorrowed = db.loans.filter((l) => l.status === "borrowed").length;
  const pendingReq = db.requests.filter((r) => r.status === "pending").length;
  const totalUsers = db.users.length;

  return (
    <RequireAuth>
      <AppLayout>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Item" value={totalItems} icon={<Boxes className="text-primary" />} />
            <StatCard
              title="Sedang Dipinjam"
              value={totalBorrowed}
              icon={<ClipboardList className="text-primary" />}
            />
            <StatCard title="Permintaan Pending" value={pendingReq} icon={<Send className="text-primary" />} />
            <StatCard title="Pengguna" value={totalUsers} icon={<Users className="text-primary" />} />
          </div>

          <div className="rounded-lg border p-4 bg-white dark:bg-neutral-900 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Aksi Cepat</div>
                <div className="text-sm text-muted-foreground">
                  Kelola inventaris dan peminjaman lebih cepat.
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/inventory">Kelola Inventaris</Link>
                </Button>
                <Button variant="outline" className="bg-transparent" asChild>
                  <Link to="/loans">Lihat Peminjaman</Link>
                </Button>
                <Button variant="outline" className="bg-transparent" asChild>
                  <Link to="/requests">Permintaan</Link>
                </Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {db.items.slice(0, 6).map((i) => (
                <div
                  key={i.id}
                  className="rounded border bg-white overflow-hidden dark:bg-neutral-900 dark:border-neutral-800"
                >
                  <img
                    src={
                      i.image ||
                      "https://pub-cdn.sider.ai/u/U024HZ4WEKZ/web-coder/68a20cc638697d89a1050142/resource/871749de-96bc-4796-b687-59a234dafef1.jpg"
                    }
                    className="object-cover h-32 w-full"
                  />
                  <div className="p-3">
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.category} • {i.location}
                    </div>
                    <div className="text-xs mt-1">
                      Tersedia: {i.available}/{i.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AuditListCompact limit={5} />
        </div>
      </AppLayout>
    </RequireAuth>
  );
}
