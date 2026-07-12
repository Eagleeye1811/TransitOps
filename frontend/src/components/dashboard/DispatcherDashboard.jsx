import { Link } from 'react-router-dom'
import { Truck, Users, Route, FileEdit, AlertTriangle, Plus } from 'lucide-react'
import { StatCard } from './StatCard'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { StatusBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { VEHICLES, VEHICLE_STATUS, getVehicleById } from '@/data/vehicles'
import { DRIVERS, DRIVER_STATUS, getDriverById } from '@/data/drivers'
import { TRIPS, TRIP_STATUS, TRIP_STATUS_LABELS } from '@/data/trips'

export function DispatcherDashboard() {
  const availableVehicles = VEHICLES.filter((v) => v.status === VEHICLE_STATUS.AVAILABLE).length
  const availableDrivers = DRIVERS.filter((d) => d.status === DRIVER_STATUS.AVAILABLE).length
  const activeTrips = TRIPS.filter((t) => t.status === TRIP_STATUS.DISPATCHED).length
  const draftTrips = TRIPS.filter((t) => t.status === TRIP_STATUS.DRAFT).length
  const delayedTrips = TRIPS.filter(
    (t) => t.status === TRIP_STATUS.DISPATCHED && (t.etaMinutes ?? 0) > 90
  ).length

  const recentlyDispatched = TRIPS.filter((t) => t.status === TRIP_STATUS.DISPATCHED).slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard icon={Truck} label="Available Vehicles" value={availableVehicles} accent="emerald" />
          <StatCard icon={Users} label="Available Drivers" value={availableDrivers} accent="blue" />
          <StatCard icon={Route} label="Active Trips" value={activeTrips} accent="brand" />
          <StatCard icon={FileEdit} label="Draft Trips" value={draftTrips} accent="slate" />
          <StatCard icon={AlertTriangle} label="Delayed Trips" value={delayedTrips} accent="red" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently Dispatched Trips</CardTitle>
          <Link to="/trips/new">
            <Button size="sm">
              <Plus className="size-4" />
              Create Trip
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentlyDispatched.length === 0 ? (
            <EmptyState icon={Route} title="No dispatched trips yet" />
          ) : (
            <TableContainer className="rounded-none border-none shadow-none">
              <THead>
                <TR>
                  <TH>Trip</TH>
                  <TH>Route</TH>
                  <TH>Vehicle</TH>
                  <TH>Driver</TH>
                  <TH>Status</TH>
                  <TH>ETA</TH>
                </TR>
              </THead>
              <TBody>
                {recentlyDispatched.map((trip) => {
                  const vehicle = getVehicleById(trip.vehicleId)
                  const driver = getDriverById(trip.driverId)
                  return (
                    <TR key={trip.id}>
                      <TD className="font-medium text-slate-900">
                        <Link to={`/trips/${trip.id}`} className="hover:text-brand-600">
                          {trip.id}
                        </Link>
                      </TD>
                      <TD>
                        {trip.source} → {trip.destination}
                      </TD>
                      <TD>{vehicle?.model ?? '—'}</TD>
                      <TD>{driver?.name ?? '—'}</TD>
                      <TD>
                        <StatusBadge status={trip.status} label={TRIP_STATUS_LABELS[trip.status]} />
                      </TD>
                      <TD>{trip.etaMinutes ? `${trip.etaMinutes} min` : '—'}</TD>
                    </TR>
                  )
                })}
              </TBody>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
