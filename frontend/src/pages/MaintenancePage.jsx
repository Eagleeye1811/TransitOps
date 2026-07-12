import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Wrench, IndianRupee } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardContent } from '@/components/common/Card'
import { Pagination } from '@/components/common/Pagination'
import { TableSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'
import { MaintenanceFilters, DEFAULT_MAINTENANCE_FILTERS } from '@/components/maintenance/MaintenanceFilters'
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/hooks/useToast'
import { MODULES, ACTIONS } from '@/config/permissions'
import { ROLES } from '@/config/roles'
import { getVehicleById } from '@/data/vehicles'
import { formatCurrency } from '@/utils/formatters'
import * as maintenanceService from '@/services/maintenanceService'

const PAGE_SIZE = 8

export default function MaintenancePage() {
  const { role } = usePermissions()
  const toast = useToast()
  const navigate = useNavigate()

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(DEFAULT_MAINTENANCE_FILTERS)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    maintenanceService.getMaintenanceRecords().then((data) => {
      if (!cancelled) {
        setRecords(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return records.filter((record) => {
      if (filters.vehicleId && record.vehicleId !== filters.vehicleId) return false
      if (filters.status && record.status !== filters.status) return false
      if (filters.date && record.serviceDate !== filters.date) return false
      if (search) {
        const vehicle = getVehicleById(record.vehicleId)
        const haystack = [record.serviceType, record.description, vehicle?.registration, vehicle?.model]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })
  }, [records, filters])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  function handleFiltersChange(next) {
    setFilters(next)
    setPage(1)
  }

  const totalCost = useMemo(() => records.reduce((sum, r) => sum + (r.cost || 0), 0), [records])

  async function handleComplete(record) {
    await maintenanceService.completeMaintenanceRecord(record.id)
    setRecords((prev) => prev.map((r) => (r.id === record.id ? { ...r, status: 'completed' } : r)))
    toast.success(`${record.id} marked as completed.`)
  }

  async function handleCancel(record) {
    await maintenanceService.cancelMaintenanceRecord(record.id)
    setRecords((prev) => prev.map((r) => (r.id === record.id ? { ...r, status: 'cancelled' } : r)))
    toast.success(`${record.id} cancelled.`)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Maintenance</h1>
          <p className="text-sm text-slate-500">Track service records, schedules and repair costs across the fleet.</p>
        </div>
        <PermissionGate module={MODULES.MAINTENANCE} action={ACTIONS.CREATE}>
          <Button onClick={() => navigate('/maintenance/new')}>
            <Plus className="size-4" />
            Add Maintenance
          </Button>
        </PermissionGate>
      </div>

      {role === ROLES.FINANCIAL_ANALYST && (
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <IndianRupee className="size-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Maintenance Cost</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalCost)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <MaintenanceFilters filters={filters} onChange={handleFiltersChange} />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <TableSkeleton rows={PAGE_SIZE} cols={6} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance records found"
          description="Try adjusting your filters, or add a new maintenance record."
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <MaintenanceTable records={paginated} onComplete={handleComplete} onCancel={handleCancel} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
