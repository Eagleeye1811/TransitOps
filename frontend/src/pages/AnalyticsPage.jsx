import { useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { BarChart3, ShieldAlert, ShieldCheck, AlertTriangle, Wallet, Route, Gauge } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { MODULES, ACCESS_LEVELS } from '@/config/permissions'
import { AnalyticsFilterBar } from '@/components/analytics/AnalyticsFilterBar'
import { ChartCard } from '@/components/analytics/ChartCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle } from '@/components/common/Card'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { StatusBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { formatCurrency, formatDate } from '@/utils/formatters'
import {
  FLEET_UTILISATION_TREND,
  TOP_COSTLIEST_VEHICLES,
  MAINTENANCE_TREND,
  UNDERUTILISED_VEHICLES,
  REPEATED_BREAKDOWNS,
  SAFETY_SCORE_TREND,
  SUSPENDED_DRIVER_TREND,
  FUEL_EFFICIENCY_TREND,
  REVENUE_TREND,
  EXPENSE_BY_CATEGORY,
} from '@/data/analytics'
import { DRIVERS, isLicenceExpiringSoon, isLicenceExpired } from '@/data/drivers'
import { VEHICLES } from '@/data/vehicles'
import { SAFETY_INCIDENTS, SAFETY_VIOLATIONS, INCIDENT_SEVERITY_LABELS } from '@/data/incidents'

const CHART_GRID = '#e2e8f0'
const CHART_AXIS = '#94a3b8'
const TOOLTIP_STYLE = { borderRadius: 8, fontSize: 12, borderColor: '#e2e8f0' }
const PIE_COLORS = ['#4f46e5', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316']

export default function AnalyticsPage() {
  const { access } = usePermissions()
  const level = access(MODULES.ANALYTICS)

  const showFleet = level === ACCESS_LEVELS.FULL || level === ACCESS_LEVELS.FLEET_ANALYTICS
  const showSafety = level === ACCESS_LEVELS.FULL || level === ACCESS_LEVELS.SAFETY_REPORTS
  const showFinancial = level === ACCESS_LEVELS.FULL || level === ACCESS_LEVELS.FINANCIAL_ANALYTICS

  return (
    <div className="space-y-8">
      <AnalyticsFilterBar />

      {showFleet && <FleetAnalyticsSection />}
      {showSafety && <SafetyReportsSection />}
      {showFinancial && <FinancialAnalyticsSection />}

      {!showFleet && !showSafety && !showFinancial && (
        <EmptyState
          icon={BarChart3}
          title="No analytics available"
          description="Your role does not currently have access to any analytics sections."
        />
      )}
    </div>
  )
}

function SectionHeader({ icon: Icon, title, accent = 'brand' }) {
  const ACCENTS = {
    brand: 'bg-brand-50 text-brand-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <div className="flex items-center gap-2.5">
      <span className={`flex size-8 items-center justify-center rounded-lg ${ACCENTS[accent] ?? ACCENTS.brand}`}>
        <Icon className="size-4" />
      </span>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Fleet Manager / Admin
// ---------------------------------------------------------------------------
function FleetAnalyticsSection() {
  return (
    <section className="space-y-4">
      <SectionHeader icon={BarChart3} title="Fleet Analytics" accent="brand" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Fleet Utilisation Trend" description="Monthly average utilisation across active fleet">
          <LineChart data={FLEET_UTILISATION_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} unit="%" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="utilisation" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Top Costliest Vehicles" description="Highest cumulative maintenance + operating spend">
          <BarChart data={TOP_COSTLIEST_VEHICLES}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="vehicle" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="cost" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Maintenance Cost Trend" description="Monthly maintenance spend across the fleet">
          <LineChart data={MAINTENANCE_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Underutilised Vehicles" description="Vehicles trending below target utilisation">
          <BarChart data={UNDERUTILISED_VEHICLES} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke={CHART_AXIS} unit="%" />
            <YAxis type="category" dataKey="vehicle" width={150} tick={{ fontSize: 11 }} stroke={CHART_AXIS} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="utilisation" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Repeated Breakdowns"
          description="Vehicles with recurring maintenance incidents"
          className="lg:col-span-2"
        >
          <BarChart data={REPEATED_BREAKDOWNS}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Safety Officer / Admin
// ---------------------------------------------------------------------------
function SafetyReportsSection() {
  const expiringCount = useMemo(() => DRIVERS.filter((d) => isLicenceExpiringSoon(d.licenceExpiry)).length, [])
  const expiredCount = useMemo(() => DRIVERS.filter((d) => isLicenceExpired(d.licenceExpiry)).length, [])
  const validCount = DRIVERS.length - expiringCount - expiredCount

  return (
    <section className="space-y-4">
      <SectionHeader icon={ShieldAlert} title="Safety Reports" accent="rose" />

      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">Licence Compliance</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={ShieldCheck} label="Valid Licences" value={validCount} accent="emerald" />
          <StatCard icon={AlertTriangle} label="Expiring Soon (60 days)" value={expiringCount} accent="amber" />
          <StatCard icon={ShieldAlert} label="Expired" value={expiredCount} accent="red" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Safety Score Trend" description="Average driver safety score across the fleet">
          <LineChart data={SAFETY_SCORE_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} domain={[60, 100]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Suspended Driver Trend" description="Drivers suspended per month">
          <BarChart data={SUSPENDED_DRIVER_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="suspended" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Safety Incidents</CardTitle>
          </CardHeader>
          <TableContainer className="rounded-none border-none shadow-none">
            <THead>
              <TR>
                <TH>Driver</TH>
                <TH>Type</TH>
                <TH>Severity</TH>
                <TH>Date</TH>
              </TR>
            </THead>
            <TBody>
              {SAFETY_INCIDENTS.map((inc) => {
                const driver = DRIVERS.find((d) => d.id === inc.driverId)
                return (
                  <TR key={inc.id}>
                    <TD>{driver?.name ?? inc.driverId}</TD>
                    <TD>{inc.type}</TD>
                    <TD>
                      <StatusBadge status={inc.severity} label={INCIDENT_SEVERITY_LABELS[inc.severity]} />
                    </TD>
                    <TD>{formatDate(inc.date)}</TD>
                  </TR>
                )
              })}
            </TBody>
          </TableContainer>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety Violations</CardTitle>
          </CardHeader>
          <TableContainer className="rounded-none border-none shadow-none">
            <THead>
              <TR>
                <TH>Driver</TH>
                <TH>Description</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {SAFETY_VIOLATIONS.map((v) => {
                const driver = DRIVERS.find((d) => d.id === v.driverId)
                return (
                  <TR key={v.id}>
                    <TD>{driver?.name ?? v.driverId}</TD>
                    <TD className="whitespace-normal">{v.description}</TD>
                    <TD>
                      <StatusBadge status={v.status} />
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </TableContainer>
        </Card>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Financial Analyst / Admin
// ---------------------------------------------------------------------------
function FinancialAnalyticsSection() {
  const top5Roi = useMemo(
    () =>
      [...VEHICLES]
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 5)
        .map((v) => ({ name: v.registration, roi: v.roi })),
    []
  )

  const avgCostPerVehicle = useMemo(
    () => VEHICLES.reduce((s, v) => s + v.operationalCostMonthly, 0) / VEHICLES.length,
    []
  )

  const totalTrips = useMemo(() => DRIVERS.reduce((s, d) => s + d.tripsCompleted, 0), [])
  const totalExpense = useMemo(() => REVENUE_TREND.reduce((s, m) => s + m.expense, 0), [])
  const costPerTrip = totalTrips ? totalExpense / totalTrips : 0

  return (
    <section className="space-y-4">
      <SectionHeader icon={Wallet} title="Financial Analytics" accent="violet" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={Gauge}
          label="Avg. Operating Cost / Vehicle / Month"
          value={formatCurrency(avgCostPerVehicle)}
          accent="violet"
        />
        <StatCard icon={Route} label="Avg. Cost / Trip (YTD)" value={formatCurrency(costPerTrip)} accent="blue" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Fuel Efficiency Trend" description="Average km/l across the fleet">
          <LineChart data={FUEL_EFFICIENCY_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} unit=" kmpl" domain={['auto', 'auto']} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="kmpl" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Operating Cost Trend" description="Monthly operating expense">
          <LineChart data={REVENUE_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Maintenance Costs" description="Monthly maintenance spend">
          <BarChart data={MAINTENANCE_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Vehicle ROI" description="Top 5 vehicles by return on investment">
          <BarChart data={top5Roi}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} unit="%" />
            <Tooltip formatter={(v) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="roi" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Expense Trends" description="Cumulative expense by category" className="lg:col-span-2">
          <PieChart>
            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Pie
              data={EXPENSE_BY_CATEGORY}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
            >
              {EXPENSE_BY_CATEGORY.map((entry, index) => (
                <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartCard>
      </div>
    </section>
  )
}
