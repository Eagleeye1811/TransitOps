import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Archive } from 'lucide-react'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { StatusBadge } from '@/components/common/Badge'
import { IconButton } from '@/components/common/Button'
import { Tooltip } from '@/components/common/Tooltip'
import { PermissionGate } from '@/components/common/PermissionGate'
import { MODULES, ACTIONS, ACCESS_LEVELS } from '@/config/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { VEHICLE_STATUS_LABELS } from '@/data/vehicles'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters'

/**
 * Role-aware vehicle table.
 * - full (Admin / Fleet Manager): all operational + financial columns, with Edit/Retire actions.
 * - view (Dispatcher): operational availability columns only, no cost/ROI, view-only.
 * - financial_view (Financial Analyst): cost & performance columns, view-only.
 */
export function VehicleTable({ vehicles, onRetire }) {
  const navigate = useNavigate()
  const { access } = usePermissions()
  const accessLevel = access(MODULES.FLEET)

  const showFinancial = accessLevel === ACCESS_LEVELS.FULL || accessLevel === ACCESS_LEVELS.FINANCIAL_VIEW
  const showOperational = accessLevel === ACCESS_LEVELS.FULL || accessLevel === ACCESS_LEVELS.VIEW

  function goToDetails(id) {
    navigate(`/fleet/${id}`)
  }

  return (
    <TableContainer>
      <THead>
        <TR>
          <TH>Registration</TH>
          <TH>Model</TH>
          <TH>Type</TH>
          {showOperational && <TH>Capacity</TH>}
          {showOperational && <TH>Region</TH>}
          {showFinancial && <TH>Acquisition Cost</TH>}
          {showFinancial && <TH>Monthly Op. Cost</TH>}
          {showFinancial && <TH>Utilisation</TH>}
          {showFinancial && <TH>ROI</TH>}
          <TH>Status</TH>
          <TH className="text-right">Actions</TH>
        </TR>
      </THead>
      <TBody>
        {vehicles.map((vehicle) => (
          <TR key={vehicle.id} onClick={() => goToDetails(vehicle.id)}>
            <TD className="font-medium text-slate-900 dark:text-slate-100">{vehicle.registration}</TD>
            <TD>{vehicle.model}</TD>
            <TD>{vehicle.type}</TD>
            {showOperational && <TD>{formatNumber(vehicle.capacityKg)} kg</TD>}
            {showOperational && <TD>{vehicle.region}</TD>}
            {showFinancial && <TD>{formatCurrency(vehicle.acquisitionCost)}</TD>}
            {showFinancial && <TD>{formatCurrency(vehicle.operationalCostMonthly)}</TD>}
            {showFinancial && <TD>{formatPercent(vehicle.utilisation)}</TD>}
            {showFinancial && <TD>{formatPercent(vehicle.roi, 1)}</TD>}
            <TD>
              <StatusBadge status={vehicle.status} label={VEHICLE_STATUS_LABELS[vehicle.status]} />
            </TD>
            <TD className="text-right">
              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Tooltip content="View details">
                  <IconButton size="sm" aria-label="View details" onClick={() => goToDetails(vehicle.id)}>
                    <Eye className="size-4" />
                  </IconButton>
                </Tooltip>
                <PermissionGate module={MODULES.FLEET} action={ACTIONS.EDIT}>
                  <Tooltip content="Edit vehicle">
                    <IconButton size="sm" aria-label="Edit vehicle" onClick={() => navigate(`/fleet/${vehicle.id}/edit`)}>
                      <Pencil className="size-4" />
                    </IconButton>
                  </Tooltip>
                </PermissionGate>
                <PermissionGate module={MODULES.FLEET} action={ACTIONS.RETIRE}>
                  <Tooltip content="Retire vehicle">
                    <IconButton
                      size="sm"
                      variant="dangerOutline"
                      aria-label="Retire vehicle"
                      disabled={vehicle.status === 'retired'}
                      onClick={() => onRetire?.(vehicle)}
                    >
                      <Archive className="size-4" />
                    </IconButton>
                  </Tooltip>
                </PermissionGate>
              </div>
            </TD>
          </TR>
        ))}
      </TBody>
    </TableContainer>
  )
}
