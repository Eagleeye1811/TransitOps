import { useEffect, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/common/Card'
import { Field, Input, Select } from '@/components/common/FormControls'
import { Button } from '@/components/common/Button'
import { PermissionGate } from '@/components/common/PermissionGate'
import { MODULES, ACTIONS } from '@/config/permissions'
import { useToast } from '@/hooks/useToast'
import { REGIONS, VEHICLE_TYPES } from '@/data/regions'
import { getVehicles } from '@/services/fleetService'

/**
 * Filter bar for the Analytics page. The date range / vehicle / region /
 * type filters are illustrative controlled state only — this prototype's
 * chart datasets are static mock aggregates and are not re-computed from
 * these filters. Export buttons call the `onExportCsv` / `onExportPdf`
 * callbacks supplied by the parent page, which build the report from
 * whatever data is currently on screen.
 */
export function AnalyticsFilterBar({ onExportCsv, onExportPdf }) {
  const toast = useToast()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [region, setRegion] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    let active = true
    // Safety Officer has no Fleet module access at all — this filter is
    // decorative anyway (see docstring), so just fall back to an empty
    // list rather than surface the 403.
    getVehicles()
      .then((data) => {
        if (active) setVehicles(data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const handleExport = (format) => {
    try {
      if (format === 'CSV') {
        onExportCsv?.()
      } else {
        onExportPdf?.()
      }
      toast.success(`Report exported as ${format}.`)
    } catch (err) {
      toast.error(`Failed to export ${format}: ${err.message}`)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Field label="From">
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </Field>
          <Field label="To">
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </Field>
          <Field label="Vehicle">
            <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">All vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Region">
            <Select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">All regions</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Vehicle Type">
            <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
              <option value="">All types</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex shrink-0 gap-2">
          <PermissionGate module={MODULES.ANALYTICS} action={ACTIONS.EXPORT}>
            <Button variant="secondary" onClick={() => handleExport('CSV')}>
              <Download className="size-4" />
              Export CSV
            </Button>
          </PermissionGate>
          <PermissionGate module={MODULES.ANALYTICS} action={ACTIONS.EXPORT}>
            <Button variant="secondary" onClick={() => handleExport('PDF')}>
              <FileText className="size-4" />
              Export PDF
            </Button>
          </PermissionGate>
        </div>
      </CardContent>
    </Card>
  )
}
