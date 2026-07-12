import { useNavigate } from 'react-router-dom'
import { Route as RouteIcon } from 'lucide-react'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { StatusBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { getVehicleById } from '@/data/vehicles'
import { getDriverById } from '@/data/drivers'
import { TRIP_STATUS, TRIP_STATUS_LABELS } from '@/data/trips'
import { formatDate } from '@/utils/formatters'

/**
 * Responsive trips table. Row click navigates to the trip's details page.
 */
export function TripTable({ trips }) {
  const navigate = useNavigate()

  if (trips.length === 0) {
    return (
      <EmptyState
        icon={RouteIcon}
        title="No trips found"
        description="Try adjusting your filters, or create a new trip to get started."
      />
    )
  }

  return (
    <TableContainer>
      <THead>
        <TR>
          <TH>Trip ID</TH>
          <TH>Route</TH>
          <TH>Vehicle</TH>
          <TH>Driver</TH>
          <TH>Status</TH>
          <TH>Scheduled</TH>
          <TH>ETA</TH>
        </TR>
      </THead>
      <TBody>
        {trips.map((trip) => {
          const vehicle = getVehicleById(trip.vehicleId)
          const driver = getDriverById(trip.driverId)
          return (
            <TR key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)}>
              <TD className="font-medium text-slate-900">{trip.id}</TD>
              <TD>
                {trip.source} → {trip.destination}
              </TD>
              <TD>{vehicle ? vehicle.registration : '—'}</TD>
              <TD>{driver ? driver.name : '—'}</TD>
              <TD>
                <StatusBadge status={trip.status} label={TRIP_STATUS_LABELS[trip.status]} />
              </TD>
              <TD>
                {formatDate(trip.scheduledDate)} · {trip.scheduledTime}
              </TD>
              <TD>
                {trip.status === TRIP_STATUS.DISPATCHED && trip.etaMinutes ? `${trip.etaMinutes} min` : '—'}
              </TD>
            </TR>
          )
        })}
      </TBody>
    </TableContainer>
  )
}
