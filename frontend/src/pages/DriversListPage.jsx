import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { TableSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import { PermissionGate } from '@/components/common/PermissionGate'
import { DriverFilters } from '@/components/drivers/DriverFilters'
import { DriverTable } from '@/components/drivers/DriverTable'
import { MODULES, ACTIONS } from '@/config/permissions'
import { getDrivers } from '@/services/driverService'
import { isLicenceExpiringSoon, isLicenceExpired } from '@/data/drivers'

const PAGE_SIZE = 8

const DEFAULT_FILTERS = { search: '', status: 'all', licenceCategory: 'all', expiry: 'all' }

export default function DriversListPage() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getDrivers().then((data) => {
      if (!active) return
      setDrivers(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return drivers.filter((driver) => {
      if (query) {
        const matchesQuery =
          driver.name.toLowerCase().includes(query) || driver.licenceNumber.toLowerCase().includes(query)
        if (!matchesQuery) return false
      }
      if (filters.status !== 'all' && driver.status !== filters.status) return false
      if (filters.licenceCategory !== 'all' && driver.licenceCategory !== filters.licenceCategory) return false
      if (filters.expiry === 'expiring_soon' && !isLicenceExpiringSoon(driver.licenceExpiry)) return false
      if (filters.expiry === 'expired' && !isLicenceExpired(driver.licenceExpiry)) return false
      return true
    })
  }, [drivers, filters])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [filters])

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Drivers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage driver records, licences, safety scores and availability.</p>
        </div>
        <PermissionGate module={MODULES.DRIVERS} action={ACTIONS.CREATE}>
          <Link to="/drivers/new">
            <Button>
              <UserPlus className="size-4" />
              Add Driver
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <DriverFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <TableSkeleton rows={8} cols={7} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No drivers found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="space-y-3">
          <DriverTable drivers={paged} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
