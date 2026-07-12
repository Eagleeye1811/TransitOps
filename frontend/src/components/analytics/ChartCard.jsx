import { ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
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
