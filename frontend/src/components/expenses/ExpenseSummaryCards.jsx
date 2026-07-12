import { Fuel, Wrench, Receipt, Wallet, Gauge, Route } from 'lucide-react'
import { Card, CardContent } from '@/components/common/Card'
import { TRIP_STATUS } from '@/data/trips'
import { formatCurrency } from '@/utils/formatters'

const ACCENTS = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  teal: 'bg-teal-50 text-teal-600',
}

function SummaryCard({ icon: Icon, label, value, hint, accent = 'brand' }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <span className={`flex size-8 items-center justify-center rounded-lg ${ACCENTS[accent]}`}>
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </CardContent>
    </Card>
  )
}

/**
 * Top-of-page cost summary, shared across the Fuel Logs and Other Expenses
 * tabs. All four inputs are fetched once by the parent page and reflect
 * live state (so totals update immediately after CRUD actions). `trips`
 * may come back empty for roles with no Trips module access (e.g.
 * Financial Analyst) — cost-per-trip/km then just render as "—".
 */
export function ExpenseSummaryCards({ fuelLogs = [], expenses = [], maintenanceRecords = [], trips = [] }) {
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0)
  const totalMaintenanceCost = maintenanceRecords.reduce((sum, m) => sum + (m.cost || 0), 0)
  const totalOtherExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const totalOperatingCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses

  const relevantTrips = trips.filter((t) => t.status === TRIP_STATUS.COMPLETED || t.status === TRIP_STATUS.DISPATCHED)
  const totalDistanceKm = relevantTrips.reduce((sum, t) => sum + (t.plannedDistanceKm || 0), 0)
  const costPerKm = totalDistanceKm > 0 ? totalOperatingCost / totalDistanceKm : null
  const costPerTrip = trips.length > 0 ? totalOperatingCost / trips.length : null

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <SummaryCard icon={Fuel} label="Total Fuel Cost" value={formatCurrency(totalFuelCost)} accent="blue" />
      <SummaryCard icon={Wrench} label="Total Maintenance Cost" value={formatCurrency(totalMaintenanceCost)} accent="amber" />
      <SummaryCard icon={Receipt} label="Other Expenses" value={formatCurrency(totalOtherExpenses)} accent="violet" />
      <SummaryCard icon={Wallet} label="Total Operating Cost" value={formatCurrency(totalOperatingCost)} accent="brand" />
      <SummaryCard
        icon={Route}
        label="Cost per KM"
        value={costPerKm !== null ? formatCurrency(costPerKm) : '—'}
        hint="Illustrative — total cost ÷ planned distance"
        accent="teal"
      />
      <SummaryCard
        icon={Gauge}
        label="Cost per Trip"
        value={costPerTrip !== null ? formatCurrency(costPerTrip) : '—'}
        hint="Illustrative — total cost ÷ trip count"
        accent="emerald"
      />
    </div>
  )
}
