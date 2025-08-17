/**
 * NotFound page for unknown routes.
 */

import { Link } from "react-router";
import { Button } from "../components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold">404</div>
        <div className="text-muted-foreground">Halaman tidak ditemukan</div>
        <Button asChild>
          <Link to="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
