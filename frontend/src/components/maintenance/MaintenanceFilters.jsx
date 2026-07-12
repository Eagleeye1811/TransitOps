import { Filter } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { Select, Input } from '@/components/common/FormControls'
import { MAINTENANCE_STATUS, MAINTENANCE_STATUS_LABELS } from '@/data/maintenance'

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_MAINTENANCE_FILTERS = { search: '', vehicleId: '', status: '', date: '' }

/**
 * Controlled filter bar for the maintenance list. Calls `onChange` with the
 * full next filters object whenever any control changes. `vehicles` is
 * fetched once by the parent page.
 */
export function MaintenanceFilters({ filters, onChange, vehicles = [] }) {
  function update(patch) {
    onChange({ ...filters, ...patch })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput
        value={filters.search}
        onChange={(value) => update({ search: value })}
        placeholder="Search by service type or description…"
        className="w-full sm:max-w-xs"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Filter className="size-3.5" />
          Filters
        </div>

        <Select
          value={filters.vehicleId}
          onChange={(e) => update({ vehicleId: e.target.value })}
          className="w-auto min-w-[10.5rem]"
          aria-label="Filter by vehicle"
        >
          <option value="">All vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration}
            </option>
          ))}
        </Select>

        <Select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className="w-auto min-w-[9.5rem]"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {Object.values(MAINTENANCE_STATUS).map((status) => (
            <option key={status} value={status}>
              {MAINTENANCE_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>

        <Input
          type="date"
          value={filters.date}
          onChange={(e) => update({ date: e.target.value })}
          className="w-auto min-w-[9.5rem]"
          aria-label="Filter by service date"
        />
      </div>
    </div>
  )
}
