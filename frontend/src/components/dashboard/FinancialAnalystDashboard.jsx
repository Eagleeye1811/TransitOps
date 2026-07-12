import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Fuel, Wrench, Wallet, Gauge, TrendingUp, Car } from 'lucide-react'
import { StatCard } from './StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { FUEL_LOGS, EXPENSES } from '@/data/fuelLogs'
import { MAINTENANCE_RECORDS } from '@/data/maintenance'
import { VEHICLES } from '@/data/vehicles'
import { REVENUE_TREND, TOP_COSTLIEST_VEHICLES, FUEL_EFFICIENCY_TREND } from '@/data/analytics'
import { formatCurrency, formatPercent } from '@/utils/formatters'

export function FinancialAnalystDashboard() {
  const totalFuel = FUEL_LOGS.reduce((s, f) => s + f.cost, 0)
  const totalMaintenance = MAINTENANCE_RECORDS.reduce((s, m) => s + m.cost, 0)
  const totalOperational = totalFuel + totalMaintenance + EXPENSES.reduce((s, e) => s + e.amount, 0)
  const avgCostPerVehicle = Math.round(totalOperational / VEHICLES.length)
  const latestEfficiency = FUEL_EFFICIENCY_TREND[FUEL_EFFICIENCY_TREND.length - 1].kmpl
  const avgRoi = (VEHICLES.reduce((s, v) => s + v.roi, 0) / VEHICLES.length).toFixed(1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Fuel} label="Total Fuel Expense" value={formatCurrency(totalFuel)} accent="blue" />
        <StatCard icon={Wrench} label="Total Maintenance" value={formatCurrency(totalMaintenance)} accent="amber" />
        <StatCard icon={Wallet} label="Total Operational" value={formatCurrency(totalOperational)} accent="red" />
        <StatCard icon={Car} label="Avg. Cost / Vehicle" value={formatCurrency(avgCostPerVehicle)} accent="violet" />
        <StatCard icon={Gauge} label="Fuel Efficiency" value={`${latestEfficiency} km/l`} accent="teal" />
        <StatCard icon={TrendingUp} label="Avg. Vehicle ROI" value={formatPercent(Number(avgRoi), 1)} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs. Expense Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#e2e8f0' }} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#revenue)" name="Revenue" />
                <Area type="monotone" dataKey="expense" stroke="#f59e0b" strokeWidth={2} fill="url(#expense)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Expensive Vehicles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {TOP_COSTLIEST_VEHICLES.map((v, i) => (
              <div key={v.vehicle} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{v.vehicle}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-red-400"
                      style={{ width: `${(v.cost / TOP_COSTLIEST_VEHICLES[0].cost) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-slate-600">{formatCurrency(v.cost)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
