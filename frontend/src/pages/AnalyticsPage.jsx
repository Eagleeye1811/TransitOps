import { useEffect, useMemo, useState } from 'react'
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
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/common/Card'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { StatusBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { CardSkeleton } from '@/components/common/Skeleton'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { exportAnalyticsReport } from '@/utils/pdfExport'
import { exportReportAsCsv } from '@/utils/csvExport'
import { getAnalyticsSummary } from '@/services/analyticsService'
import { DRIVERS, isLicenceExpiringSoon, isLicenceExpired } from '@/data/drivers'
import { VEHICLES } from '@/data/vehicles'
import { SAFETY_INCIDENTS, SAFETY_VIOLATIONS, INCIDENT_SEVERITY_LABELS } from '@/data/incidents'

const CHART_GRID = '#e2e8f0'
const CHART_AXIS = '#94a3b8'
const TOOLTIP_STYLE = { borderRadius: 8, fontSize: 12, borderColor: '#e2e8f0' }
const PIE_COLORS = ['#4f46e5', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316']

// Live-computed from the DB by GET /analytics/summary — see
// backend/app/services/analytics_service.py. Used as the initial state and
// as a safe fallback so chart components / the report builder never see
// `undefined` while the first fetch is in flight or if it fails.
const EMPTY_SUMMARY = {
  fleetUtilisationTrend: [],
  topCostliestVehicles: [],
  expenseByCategory: [],
  vehicleTypeBreakdown: [],
  underutilisedVehicles: [],
  safetyScoreTrend: [],
  suspendedDriverTrend: [],
  fuelEfficiencyTrend: [],
  maintenanceTrend: [],
  revenueTrend: [],
  repeatedBreakdowns: [],
  totalFuelCost: 0,
  totalMaintenanceCost: 0,
  totalExpenseCost: 0,
  avgCostPerVehicle: 0,
  avgVehicleRoi: 0,
  expiringLicencesCount: 0,
  expiredLicencesCount: 0,
  openIncidentsCount: 0,
  openViolationsCount: 0,
}

export default function AnalyticsPage() {
  const { access } = usePermissions()
  const level = access(MODULES.ANALYTICS)

  const showFleet = level === ACCESS_LEVELS.FULL || level === ACCESS_LEVELS.FLEET_ANALYTICS
  const showSafety = level === ACCESS_LEVELS.FULL || level === ACCESS_LEVELS.SAFETY_REPORTS
  const showFinancial = level === ACCESS_LEVELS.FULL || level === ACCESS_LEVELS.FINANCIAL_ANALYTICS
  const hasAnyAccess = showFleet || showSafety || showFinancial

  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(hasAnyAccess)

  useEffect(() => {
    if (!hasAnyAccess) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    getAnalyticsSummary()
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
    // hasAnyAccess is derived from `level`, which only changes on login/role switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  const reportData = useMemo(
    () => buildReportData({ summary, showFleet, showSafety, showFinancial }),
    [summary, showFleet, showSafety, showFinancial]
  )

  const handleExportPdf = () => exportAnalyticsReport(reportData)
  const handleExportCsv = () =>
    exportReportAsCsv({ ...reportData, filename: 'transitops-analytics-report.csv' })

  return (
    <div className="space-y-8">
      <AnalyticsFilterBar onExportPdf={handleExportPdf} onExportCsv={handleExportCsv} />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} className="h-80" />
          ))}
        </div>
      ) : (
        <>
          {showFleet && <FleetAnalyticsSection summary={summary} />}
          {showSafety && <SafetyReportsSection summary={summary} />}
          {showFinancial && <FinancialAnalyticsSection summary={summary} />}

          {!hasAnyAccess && (
            <EmptyState
              icon={BarChart3}
              title="No analytics available"
              description="Your role does not currently have access to any analytics sections."
            />
          )}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Export report builder — assembles the same {title, kpis, tables} shape
// consumed by both exportAnalyticsReport (PDF) and exportReportAsCsv (CSV)
// from whichever sections are currently visible to the signed-in role, now
// sourced from the live GET /analytics/summary payload instead of the old
// static mock data.
// ---------------------------------------------------------------------------
function buildReportData({ summary, showFleet, showSafety, showFinancial }) {
  const kpis = []
  const tables = []

  if (showFleet) {
    const latestUtilisation = summary.fleetUtilisationTrend[summary.fleetUtilisationTrend.length - 1]
    const latestMaintenance = summary.maintenanceTrend[summary.maintenanceTrend.length - 1]
    if (latestUtilisation) kpis.push({ label: 'Fleet Utilisation (current)', value: `${latestUtilisation.utilisation}%` })
    if (latestMaintenance) kpis.push({ label: 'Maintenance Cost (current)', value: formatCurrency(latestMaintenance.cost) })

    tables.push({
      heading: 'Top Costliest Vehicles',
      columns: ['Vehicle', 'Cost'],
      rows: summary.topCostliestVehicles.map((v) => [v.vehicle, formatCurrency(v.cost)]),
    })
    tables.push({
      heading: 'Underutilised Vehicles',
      columns: ['Vehicle', 'Utilisation'],
      rows: summary.underutilisedVehicles.map((v) => [v.vehicle, `${v.utilisation}%`]),
    })
    tables.push({
      heading: 'Repeated Breakdowns',
      columns: ['Vehicle', 'Incidents'],
      rows: summary.repeatedBreakdowns.map((v) => [v.vehicle, v.incidents]),
    })
  }

  if (showSafety) {
    const expiringCount = DRIVERS.filter((d) => isLicenceExpiringSoon(d.licenceExpiry)).length
    const expiredCount = DRIVERS.filter((d) => isLicenceExpired(d.licenceExpiry)).length
    const validCount = DRIVERS.length - expiringCount - expiredCount
    kpis.push({ label: 'Valid Licences', value: validCount })
    kpis.push({ label: 'Expiring Soon (60 days)', value: expiringCount })
    kpis.push({ label: 'Expired Licences', value: expiredCount })

    tables.push({
      heading: 'Safety Incidents',
      columns: ['Driver', 'Type', 'Severity', 'Date'],
      rows: SAFETY_INCIDENTS.map((inc) => {
        const driver = DRIVERS.find((d) => d.id === inc.driverId)
        return [driver?.name ?? inc.driverId, inc.type, INCIDENT_SEVERITY_LABELS[inc.severity] ?? inc.severity, formatDate(inc.date)]
      }),
    })
    tables.push({
      heading: 'Safety Violations',
      columns: ['Driver', 'Description', 'Status'],
      rows: SAFETY_VIOLATIONS.map((v) => {
        const driver = DRIVERS.find((d) => d.id === v.driverId)
        return [driver?.name ?? v.driverId, v.description, v.status]
      }),
    })
  }

  if (showFinancial) {
    const totalTrips = DRIVERS.reduce((s, d) => s + d.tripsCompleted, 0)
    // revenueTrend is always empty (this schema has no revenue/billing
    // concept — see analytics_service.py), so "cost per trip" is derived
    // from the live cost totals the summary does provide.
    const totalExpense = summary.totalExpenseCost + summary.totalFuelCost + summary.totalMaintenanceCost
    const costPerTrip = totalTrips ? totalExpense / totalTrips : 0
    kpis.push({ label: 'Avg. Operating Cost / Vehicle / Month', value: formatCurrency(summary.avgCostPerVehicle) })
    kpis.push({ label: 'Avg. Cost / Trip', value: formatCurrency(costPerTrip) })

    const top5Roi = [...VEHICLES].sort((a, b) => b.roi - a.roi).slice(0, 5)
    tables.push({
      heading: 'Vehicle ROI (Top 5)',
      columns: ['Vehicle', 'ROI'],
      rows: top5Roi.map((v) => [v.registration, `${v.roi}%`]),
    })
    tables.push({
      heading: 'Expense by Category',
      columns: ['Category', 'Amount'],
      rows: summary.expenseByCategory.map((e) => [e.category, formatCurrency(e.amount)]),
    })
  }

  return { title: 'TransitOps Analytics Report', kpis, tables }
}

function SectionHeader({ icon: Icon, title, accent = 'brand' }) {
  const ACCENTS = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-2.5">
      <span className={`flex size-8 items-center justify-center rounded-lg ${ACCENTS[accent] ?? ACCENTS.brand}`}>
        <Icon className="size-4" />
      </span>
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
    </div>
  )
}

// A chart card with no data to show — e.g. no vehicles have 2+ maintenance
// records yet, so "Repeated Breakdowns" has nothing to plot. Mirrors
// ChartCard's layout (title/description in the header) without pushing an
// empty dataset into Recharts, which would otherwise render a blank axis.
function EmptyChartCard({ title, description, note, className }) {
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

// ---------------------------------------------------------------------------
// Fleet Manager / Admin
// ---------------------------------------------------------------------------
function FleetAnalyticsSection({ summary }) {
  const {
    fleetUtilisationTrend,
    topCostliestVehicles,
    maintenanceTrend,
    underutilisedVehicles,
    repeatedBreakdowns,
  } = summary

  return (
    <section className="space-y-4">
      <SectionHeader icon={BarChart3} title="Fleet Analytics" accent="brand" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Fleet Utilisation Trend"
          description="Current average utilisation across active fleet (live snapshot — historical trending needs a snapshot table, not yet built)"
        >
          <LineChart data={fleetUtilisationTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} unit="%" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="utilisation" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        {topCostliestVehicles.length === 0 ? (
          <EmptyChartCard
            title="Top Costliest Vehicles"
            description="Highest cumulative maintenance + fuel spend"
          />
        ) : (
          <ChartCard title="Top Costliest Vehicles" description="Highest cumulative maintenance + fuel spend">
            <BarChart data={topCostliestVehicles}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="vehicle" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
              <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="cost" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
        )}

        <ChartCard title="Maintenance Cost Trend" description="Current total maintenance spend across the fleet">
          <LineChart data={maintenanceTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        {underutilisedVehicles.length === 0 ? (
          <EmptyChartCard
            title="Underutilised Vehicles"
            description="Vehicles trending below target utilisation"
          />
        ) : (
          <ChartCard title="Underutilised Vehicles" description="Vehicles trending below target utilisation">
            <BarChart data={underutilisedVehicles} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke={CHART_AXIS} unit="%" />
              <YAxis type="category" dataKey="vehicle" width={150} tick={{ fontSize: 11 }} stroke={CHART_AXIS} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="utilisation" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartCard>
        )}

        {repeatedBreakdowns.length === 0 ? (
          <EmptyChartCard
            title="Repeated Breakdowns"
            description="Vehicles with recurring maintenance incidents"
            note="No vehicle currently has 2 or more maintenance records."
            className="lg:col-span-2"
          />
        ) : (
          <ChartCard
            title="Repeated Breakdowns"
            description="Vehicles with recurring maintenance incidents"
            className="lg:col-span-2"
          >
            <BarChart data={repeatedBreakdowns}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} stroke={CHART_AXIS} />
              <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Safety Officer / Admin
// ---------------------------------------------------------------------------
function SafetyReportsSection({ summary }) {
  const { safetyScoreTrend, suspendedDriverTrend } = summary

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
        <ChartCard title="Safety Score Trend" description="Current average driver safety score across the fleet">
          <LineChart data={safetyScoreTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} domain={[60, 100]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Suspended Driver Trend" description="Drivers currently suspended">
          <BarChart data={suspendedDriverTrend}>
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
function FinancialAnalyticsSection({ summary }) {
  const { fuelEfficiencyTrend, maintenanceTrend, revenueTrend, expenseByCategory, avgCostPerVehicle } = summary

  const top5Roi = useMemo(
    () =>
      [...VEHICLES]
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 5)
        .map((v) => ({ name: v.registration, roi: v.roi })),
    []
  )

  const totalTrips = useMemo(() => DRIVERS.reduce((s, d) => s + d.tripsCompleted, 0), [])
  // revenueTrend is always empty (this schema has no revenue/billing
  // concept — see analytics_service.py) so "cost per trip" is derived from
  // the live cost totals the summary does provide, not from mock revenue.
  const totalExpense = summary.totalExpenseCost + summary.totalFuelCost + summary.totalMaintenanceCost
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
        <StatCard icon={Route} label="Avg. Cost / Trip" value={formatCurrency(costPerTrip)} accent="blue" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Fuel Efficiency Trend" description="Current average km/l across the fleet">
          <LineChart data={fuelEfficiencyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
            <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} unit=" kmpl" domain={['auto', 'auto']} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="kmpl" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        {revenueTrend.length === 0 ? (
          <EmptyChartCard
            title="Operating Cost Trend"
            description="Monthly operating expense"
            note="This is an operations system, not a billing one — there's no revenue/expense history to trend here."
          />
        ) : (
          <ChartCard title="Operating Cost Trend" description="Monthly operating expense">
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
              <YAxis tick={{ fontSize: 12 }} stroke={CHART_AXIS} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ChartCard>
        )}

        <ChartCard title="Maintenance Costs" description="Current total maintenance spend">
          <BarChart data={maintenanceTrend}>
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

        {expenseByCategory.length === 0 ? (
          <EmptyChartCard
            title="Expense Trends"
            description="Cumulative expense by category"
            className="lg:col-span-2"
          />
        ) : (
          <ChartCard title="Expense Trends" description="Cumulative expense by category" className="lg:col-span-2">
            <PieChart>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Pie
                data={expenseByCategory}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
              >
                {expenseByCategory.map((entry, index) => (
                  <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartCard>
        )}
      </div>
    </section>
  )
}
