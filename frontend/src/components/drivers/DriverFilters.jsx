import { SlidersHorizontal } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/common/FormControls'
import { DRIVER_STATUS, DRIVER_STATUS_LABELS, LICENCE_CATEGORIES } from '@/data/drivers'

/**
 * Filter bar for the drivers list: search + status + licence category +
 * licence expiry. Fully controlled — parent owns `filters` state.
 */
export function DriverFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
      <div className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 sm:flex">
        <SlidersHorizontal className="size-3.5" />
        Filters
      </div>

      <SearchInput
        value={filters.search}
        onChange={(value) => set('search', value)}
        placeholder="Search drivers by name…"
        className="w-full sm:max-w-xs"
      />

      <Select
        value={filters.status}
        onChange={(e) => set('status', e.target.value)}
        className="w-full sm:w-44"
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        {Object.values(DRIVER_STATUS).map((status) => (
          <option key={status} value={status}>
            {DRIVER_STATUS_LABELS[status]}
          </option>
        ))}
      </Select>

      <Select
        value={filters.licenceCategory}
        onChange={(e) => set('licenceCategory', e.target.value)}
        className="w-full sm:w-40"
        aria-label="Filter by licence category"
      >
        <option value="all">All categories</option>
        {LICENCE_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>

      <Select
        value={filters.expiry}
        onChange={(e) => set('expiry', e.target.value)}
        className="w-full sm:w-44"
        aria-label="Filter by licence expiry"
      >
        <option value="all">All licences</option>
        <option value="expiring_soon">Expiring soon</option>
        <option value="expired">Expired</option>
      </Select>
    </div>
  )
}
