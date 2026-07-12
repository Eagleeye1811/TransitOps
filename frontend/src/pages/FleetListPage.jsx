import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Truck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { TableContainer, THead, TBody, TR, TH } from '@/components/common/Table'
import { TableSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PermissionGate } from '@/components/common/PermissionGate'
import { VehicleFilters, DEFAULT_VEHICLE_FILTERS } from '@/components/fleet/VehicleFilters'
import { VehicleTable } from '@/components/fleet/VehicleTable'
import { MODULES, ACTIONS } from '@/config/permissions'
import { useToast } from '@/hooks/useToast'
import * as fleetService from '@/services/fleetService'

const PAGE_SIZE = 8

export default function FleetListPage() {
  const toast = useToast()

  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(DEFAULT_VEHICLE_FILTERS)
  const [page, setPage] = useState(1)
  const [retireTarget, setRetireTarget] = useState(null)
  const [retiring, setRetiring] = useState(false)

  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fleetService.getVehicles().then((data) => {
      if (!active) return
      setVehicles(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return vehicles.filter((v) => {
      if (search && !`${v.registration} ${v.model}`.toLowerCase().includes(search)) return false
      if (filters.status && v.status !== filters.status) return false
      if (filters.type && v.type !== filters.type) return false
      if (filters.region && v.region !== filters.region) return false
      return true
    })
  }, [vehicles, filters])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [filters])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  function handleFiltersChange(next) {
    setFilters(next)
  }

  function handleClearFilters() {
    setFilters(DEFAULT_VEHICLE_FILTERS)
  }

  async function handleRetireConfirm() {
    if (!retireTarget) return
    setRetiring(true)
    try {
      await fleetService.retireVehicle(retireTarget.id)
      setVehicles((prev) =>
        prev.map((v) => (v.id === retireTarget.id ? { ...v, status: 'retired', utilisation: 0 } : v))
      )
      toast.success(`${retireTarget.registration} has been retired.`)
      setRetireTarget(null)
    } catch {
      toast.error('Failed to retire vehicle. Please try again.')
    } finally {
      setRetiring(false)
    }
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Fleet</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your organisation&apos;s vehicles, capacity and status.</p>
        </div>
        <PermissionGate module={MODULES.FLEET} action={ACTIONS.CREATE}>
          <Link to="/fleet/new">
            <Button>
              <Plus className="size-4" />
              Add Vehicle
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <VehicleFilters filters={filters} onChange={handleFiltersChange} />

      {loading ? (
        <TableContainer>
          <THead>
            <TR>
              <TH>Registration</TH>
              <TH>Model</TH>
              <TH>Type</TH>
              <TH>Capacity</TH>
              <TH>Region</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            <tr>
              <td colSpan={6} className="p-0">
                <TableSkeleton rows={PAGE_SIZE} cols={6} />
              </td>
            </tr>
          </TBody>
        </TableContainer>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <EmptyState
            icon={Truck}
            title="No vehicles found"
            description={
              hasActiveFilters
                ? 'No vehicles match your current filters. Try adjusting or clearing them.'
                : 'No vehicles have been added to the fleet yet.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="secondary" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              ) : (
                <PermissionGate module={MODULES.FLEET} action={ACTIONS.CREATE}>
                  <Link to="/fleet/new">
                    <Button>
                      <Plus className="size-4" />
                      Add Vehicle
                    </Button>
                  </Link>
                </PermissionGate>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          <VehicleTable vehicles={paginated} onRetire={setRetireTarget} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={!!retireTarget}
        onClose={() => setRetireTarget(null)}
        onConfirm={handleRetireConfirm}
        loading={retiring}
        tone="danger"
        title="Retire this vehicle?"
        description={
          retireTarget
            ? `${retireTarget.registration} (${retireTarget.model}) will be marked as retired and removed from active dispatch. This cannot be undone.`
            : undefined
        }
        confirmLabel="Retire Vehicle"
      />
    </div>
  )
}
