import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/common/FormControls'
import { TRIP_STATUS, TRIP_STATUS_LABELS } from '@/data/trips'

/**
 * Search + status + scheduled-date filters for the trips list.
 * Fully controlled — parent owns the filter state.
 */
export function TripFilters({ search, onSearchChange, status, onStatusChange, date, onDateChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search by trip ID, source or destination…"
        className="sm:max-w-xs sm:flex-1"
      />
      <Select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="sm:max-w-[180px]"
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {Object.values(TRIP_STATUS).map((s) => (
          <option key={s} value={s}>
            {TRIP_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        aria-label="Filter by scheduled date"
        className="block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:max-w-[170px]"
      />
      {date && (
        <button
          type="button"
          onClick={() => onDateChange('')}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Clear date
        </button>
      )}
    </div>
  )
}
