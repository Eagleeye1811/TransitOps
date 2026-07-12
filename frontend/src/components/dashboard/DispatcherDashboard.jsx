import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, Users, Route, FileEdit, AlertTriangle, Plus } from 'lucide-react'
import { StatCard } from './StatCard'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { StatusBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { CardSkeleton } from '@/components/common/Skeleton'
import { VEHICLE_STATUS } from '@/data/vehicles'
import { DRIVER_STATUS } from '@/data/drivers'
import { TRIP_STATUS, TRIP_STATUS_LABELS } from '@/data/trips'
import * as fleetService from '@/services/fleetService'
import * as driverService from '@/services/driverService'
import * as tripService from '@/services/tripService'

export function DispatcherDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([fleetService.getVehicles(), driverService.getDrivers(), tripService.getTrips()])
      .then(([vehicles, drivers, trips]) => {
        if (!active) return
        setData({ vehicles, drivers, trips })
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  const { vehicles, drivers, trips } = data
  const vehiclesById = new Map(vehicles.map((v) => [v.id, v]))
  const driversById = new Map(drivers.map((d) => [d.id, d]))

  const availableVehicles = vehicles.filter((v) => v.status === VEHICLE_STATUS.AVAILABLE).length
  const availableDrivers = drivers.filter((d) => d.status === DRIVER_STATUS.AVAILABLE).length
  const activeTrips = trips.filter((t) => t.status === TRIP_STATUS.DISPATCHED).length
  const draftTrips = trips.filter((t) => t.status === TRIP_STATUS.DRAFT).length
  const delayedTrips = trips.filter(
    (t) => t.status === TRIP_STATUS.DISPATCHED && (t.etaMinutes ?? 0) > 90
  ).length

  const recentlyDispatched = trips.filter((t) => t.status === TRIP_STATUS.DISPATCHED).slice(0, 6)

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
                  const vehicle = vehiclesById.get(trip.vehicleId)
                  const driver = driversById.get(trip.driverId)
                  return (
                    <TR key={trip.id}>
                      <TD className="font-medium text-slate-900 dark:text-slate-100">
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
