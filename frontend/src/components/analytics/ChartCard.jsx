import { ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { cn } from '@/utils/cn'

/**
 * Reusable card wrapper for a single Recharts chart. Wraps children (a
 * Recharts chart element, e.g. <LineChart>...</LineChart>) in a
 * ResponsiveContainer inside a fixed-height content area, so individual
 * analytics sections don't repeat the same boilerplate.
 */
export function ChartCard({ title, description, children, className, height = 'h-80' }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className={cn(height)}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/**
 * Same header/layout as ChartCard, but for when there's no data to chart —
 * avoids pushing an empty dataset into Recharts, which would otherwise
 * render a blank axis.
 */
export function EmptyChartCard({ title, description, note, className }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>
      <div className="flex h-80 items-center justify-center px-5">
        <EmptyState title="Not enough data yet" description={note ?? 'This chart will populate once more records exist.'} />
      </div>
    </Card>
  )
}
