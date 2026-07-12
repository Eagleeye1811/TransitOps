import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { TripForm } from '@/components/trips/TripForm'
import { TRIP_STATUS } from '@/data/trips'
import * as tripService from '@/services/tripService'
import { useToast } from '@/hooks/useToast'

export default function TripFormPage() {
  const { tripId } = useParams()
  const isEdit = Boolean(tripId)
  const navigate = useNavigate()
  const toast = useToast()

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [notEditable, setNotEditable] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let active = true
    tripService.getTripById(tripId).then((t) => {
      if (!active) return
      if (!t) {
        setNotEditable(true)
      } else {
        setTrip(t)
        if (t.status !== TRIP_STATUS.DRAFT) setNotEditable(true)
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [isEdit, tripId])

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      if (isEdit) {
        await tripService.updateTrip(tripId, payload)
        toast.success(`${tripId} updated.`)
        navigate(`/trips/${tripId}`)
      } else {
        const created = await tripService.createTrip(payload)
        toast.success(`${created.id} created as a draft.`)
        navigate(`/trips/${created.id}`)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
  }

  if (isEdit && notEditable) {
    return (
      <EmptyState
        title={trip ? 'Only draft trips can be edited' : 'Trip not found'}
        description={
          trip
            ? `${trip.id} is ${trip.status} and can no longer be edited.`
            : 'This trip may have been removed or the link is incorrect.'
        }
        action={
          <Link to={trip ? `/trips/${trip.id}` : '/trips'}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="size-4" />
              {trip ? 'Back to Trip Details' : 'Back to Trips'}
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? `Edit Draft Trip — ${tripId}` : 'New Trip'}</CardTitle>
        </CardHeader>
        <CardContent>
          <TripForm
            initialValues={trip ?? undefined}
            tripId={isEdit ? tripId : null}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel={isEdit ? 'Save Changes' : 'Create Trip'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
