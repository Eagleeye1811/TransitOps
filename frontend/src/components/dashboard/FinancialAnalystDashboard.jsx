import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Fuel, Wrench, Wallet, Gauge, TrendingUp, Car } from 'lucide-react'
import { StatCard } from './StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { ChartCard, EmptyChartCard } from '@/components/analytics/ChartCard'
import { CardSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import * as analyticsService from '@/services/analyticsService'

export function FinancialAnalystDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    analyticsService
      .getAnalyticsSummary()
      .then((data) => {
        if (!active) return
        setSummary(data)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  const {
    totalFuelCost,
    totalMaintenanceCost,
    totalExpenseCost,
    avgCostPerVehicle,
    avgVehicleRoi,
    fuelEfficiencyTrend,
    topCostliestVehicles,
    revenueTrend,
  } = summary
  const totalOperational = totalFuelCost + totalMaintenanceCost + totalExpenseCost
  const latestEfficiency = fuelEfficiencyTrend.length
    ? fuelEfficiencyTrend[fuelEfficiencyTrend.length - 1].kmpl
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Fuel} label="Total Fuel Expense" value={formatCurrency(totalFuelCost)} accent="blue" />
        <StatCard icon={Wrench} label="Total Maintenance" value={formatCurrency(totalMaintenanceCost)} accent="amber" />
        <StatCard icon={Wallet} label="Total Operational" value={formatCurrency(totalOperational)} accent="red" />
        <StatCard icon={Car} label="Avg. Cost / Vehicle" value={formatCurrency(avgCostPerVehicle)} accent="violet" />
        <StatCard icon={Gauge} label="Fuel Efficiency" value={`${latestEfficiency} km/l`} accent="teal" />
        <StatCard icon={TrendingUp} label="Avg. Vehicle ROI" value={formatPercent(Number(avgVehicleRoi), 1)} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {revenueTrend.length === 0 ? (
          <EmptyChartCard
            className="lg:col-span-2"
            title="Operating Cost Trend"
            description="Monthly operating expense"
            note="This is an operations system, not a billing one — there's no revenue/expense history to trend here."
          />
        ) : (
          <ChartCard className="lg:col-span-2" title="Operating Cost Trend" description="Monthly operating expense">
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#e2e8f0' }} />
              <Area type="monotone" dataKey="expense" stroke="#f59e0b" strokeWidth={2} fill="url(#expense)" name="Expense" />
            </AreaChart>
          </ChartCard>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Most Expensive Vehicles</CardTitle>
          </CardHeader>
          <CardContent className={topCostliestVehicles.length === 0 ? '' : 'space-y-3'}>
            {topCostliestVehicles.length === 0 && (
              <EmptyState title="Not enough data yet" description="This will populate once vehicles have fuel or maintenance costs." />
            )}
            {topCostliestVehicles.map((v, i) => (
              <div key={v.vehicle} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{v.vehicle}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-red-400"
                      style={{ width: `${(v.cost / topCostliestVehicles[0].cost) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400">{formatCurrency(v.cost)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
