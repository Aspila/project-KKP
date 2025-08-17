/**
 * StatCard shows a single KPI with icon.
 */

import { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  hint?: string
}

/** Small stat card for dashboard overview */
export default function StatCard({ title, value, icon, hint }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
    </div>
  )
}
