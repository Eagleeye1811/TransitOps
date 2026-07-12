import { useNavigate } from 'react-router-dom'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { StatusBadge, Badge } from '@/components/common/Badge'
import { Tooltip } from '@/components/common/Tooltip'
import { usePermissions } from '@/hooks/usePermissions'
import { MODULES, ACCESS_LEVELS } from '@/config/permissions'
import { DRIVER_STATUS_LABELS, isLicenceExpiringSoon, isLicenceExpired } from '@/data/drivers'
import { formatDate } from '@/utils/formatters'

function LicenceExpiryCell({ expiry }) {
  const expired = isLicenceExpired(expiry)
  const expiringSoon = !expired && isLicenceExpiringSoon(expiry)
  return (
    <div className="flex items-center gap-2">
      <span>{formatDate(expiry)}</span>
      {expired && (
        <Tooltip content="Licence has expired">
          <Badge color="red">Expired</Badge>
        </Tooltip>
      )}
      {expiringSoon && (
        <Tooltip content="Licence expires within 60 days">
          <Badge color="amber">Expiring soon</Badge>
        </Tooltip>
      )}
    </div>
  )
}

/**
 * Role-aware drivers table. Column set is derived from the current user's
 * Drivers module access level:
 *  - full (admin, safety officer): everything
 *  - operational_view (fleet manager): everything except nothing hidden,
 *    but no edit affordances live here (that's the details/edit pages)
 *  - availability_view (dispatcher): name, licence category, availability only
 */
export function DriverTable({ drivers }) {
  const navigate = useNavigate()
  const { access } = usePermissions()
  const level = access(MODULES.DRIVERS)
  const goTo = (id) => navigate(`/drivers/${id}`)

  if (level === ACCESS_LEVELS.AVAILABILITY_VIEW) {
    return (
      <TableContainer>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Licence Category</TH>
            <TH>Availability</TH>
          </TR>
        </THead>
        <TBody>
          {drivers.map((driver) => (
            <TR key={driver.id} onClick={() => goTo(driver.id)}>
              <TD className="font-medium text-slate-900 dark:text-slate-100">{driver.name}</TD>
              <TD>{driver.licenceCategory}</TD>
              <TD>
                <StatusBadge status={driver.status} label={DRIVER_STATUS_LABELS[driver.status]} />
              </TD>
            </TR>
          ))}
        </TBody>
      </TableContainer>
    )
  }

  return (
    <TableContainer>
      <THead>
        <TR>
          <TH>Name</TH>
          <TH>Licence No.</TH>
          <TH>Category</TH>
          <TH>Licence Expiry</TH>
          <TH>Region</TH>
          <TH>Contact</TH>
          <TH>Assignment</TH>
          <TH>Safety Score</TH>
          <TH>Status</TH>
        </TR>
      </THead>
      <TBody>
        {drivers.map((driver) => (
          <TR key={driver.id} onClick={() => goTo(driver.id)}>
            <TD className="font-medium text-slate-900 dark:text-slate-100">{driver.name}</TD>
            <TD>{driver.licenceNumber}</TD>
            <TD>{driver.licenceCategory}</TD>
            <TD>
              <LicenceExpiryCell expiry={driver.licenceExpiry} />
            </TD>
            <TD>{driver.region}</TD>
            <TD>{driver.contact}</TD>
            <TD>{driver.currentAssignment ?? '—'}</TD>
            <TD>{driver.safetyScore}</TD>
            <TD>
              <StatusBadge status={driver.status} label={DRIVER_STATUS_LABELS[driver.status]} />
            </TD>
          </TR>
        ))}
      </TBody>
    </TableContainer>
  )
}
