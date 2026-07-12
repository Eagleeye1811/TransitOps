import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { TableSkeleton } from '@/components/common/Skeleton'
import { Pagination } from '@/components/common/Pagination'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TripFilters } from '@/components/trips/TripFilters'
import { TripTable } from '@/components/trips/TripTable'
import { MODULES, ACTIONS } from '@/config/permissions'
import * as tripService from '@/services/tripService'

const PAGE_SIZE = 8

export default function TripsListPage() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true
    tripService.getTrips().then((data) => {
      if (!active) return
      setTrips(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return trips.filter((t) => {
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q)
      const matchesStatus = !status || t.status === status
      const matchesDate = !date || t.scheduledDate === date
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [trips, search, status, date])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [search, status, date])

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Trips</h1>
          <p className="mt-0.5 text-sm text-slate-500">Plan, dispatch and track fleet trips.</p>
        </div>
        <PermissionGate module={MODULES.TRIPS} action={ACTIONS.CREATE}>
          <Link to="/trips/new">
            <Button>
              <Plus className="size-4" />
              Create Trip
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <TripFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        date={date}
        onDateChange={setDate}
      />

      {loading ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <TableSkeleton rows={PAGE_SIZE} cols={7} />
        </div>
      ) : (
        <>
          <TripTable trips={paged} />
          {filtered.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
