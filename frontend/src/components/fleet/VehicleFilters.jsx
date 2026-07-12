import { Filter } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/common/FormControls'
import { VEHICLE_STATUS, VEHICLE_STATUS_LABELS } from '@/data/vehicles'
import { REGIONS, VEHICLE_TYPES } from '@/data/regions'

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_VEHICLE_FILTERS = { search: '', status: '', type: '', region: '' }

/**
 * Controlled filter bar for the fleet list. Calls `onChange` with the
 * full next filters object whenever any control changes.
 */
export function VehicleFilters({ filters, onChange }) {
  function update(patch) {
    onChange({ ...filters, ...patch })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput
        value={filters.search}
        onChange={(value) => update({ search: value })}
        placeholder="Search by registration or model…"
        className="w-full sm:max-w-xs"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Filter className="size-3.5" />
          Filters
        </div>

        <Select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className="w-auto min-w-[9.5rem]"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {Object.values(VEHICLE_STATUS).map((status) => (
            <option key={status} value={status}>
              {VEHICLE_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>

        <Select
          value={filters.type}
          onChange={(e) => update({ type: e.target.value })}
          className="w-auto min-w-[9.5rem]"
          aria-label="Filter by vehicle type"
        >
          <option value="">All types</option>
          {VEHICLE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>

        <Select
          value={filters.region}
          onChange={(e) => update({ region: e.target.value })}
          className="w-auto min-w-[9.5rem]"
          aria-label="Filter by region"
        >
          <option value="">All regions</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
