import { useEffect, useMemo, useState } from 'react'
import { Clock, ShieldAlert, UserX, AlertOctagon, FileWarning, Plus } from 'lucide-react'
import { Tabs } from '@/components/common/Tabs'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/common/Card'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { StatusBadge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Field, Input, Select, Textarea } from '@/components/common/FormControls'
import { PermissionGate } from '@/components/common/PermissionGate'
import { EmptyState } from '@/components/common/EmptyState'
import { TableSkeleton } from '@/components/common/Skeleton'
import { MODULES, ACTIONS } from '@/config/permissions'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/utils/formatters'
import { DRIVERS as DRIVERS_SEED, DRIVER_STATUS, isLicenceExpiringSoon, isLicenceExpired } from '@/data/drivers'
import { VEHICLES } from '@/data/vehicles'
import { SAFETY_INCIDENTS, SAFETY_VIOLATIONS, INCIDENT_SEVERITY_LABELS } from '@/data/incidents'
import { getDrivers, updateDriver, updateDriverStatus } from '@/services/driverService'

const TABS = [
  { value: 'expiring', label: 'Expiring Licences', icon: Clock },
  { value: 'expired', label: 'Expired Licences', icon: ShieldAlert },
  { value: 'suspended', label: 'Suspended Drivers', icon: UserX },
  { value: 'incidents', label: 'Safety Incidents', icon: AlertOctagon },
  { value: 'violations', label: 'Safety Violations', icon: FileWarning },
]

export default function CompliancePage() {
  const toast = useToast()
  const [active, setActive] = useState('expiring')

  const [drivers, setDrivers] = useState(DRIVERS_SEED)
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState(SAFETY_INCIDENTS)
  const [violations, setViolations] = useState(SAFETY_VIOLATIONS)

  useEffect(() => {
    let mounted = true
    getDrivers().then((list) => {
      if (mounted) {
        setDrivers(list)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const expiringDrivers = useMemo(() => drivers.filter((d) => isLicenceExpiringSoon(d.licenceExpiry)), [drivers])
  const expiredDrivers = useMemo(() => drivers.filter((d) => isLicenceExpired(d.licenceExpiry)), [drivers])
  const suspendedDrivers = useMemo(() => drivers.filter((d) => d.status === DRIVER_STATUS.SUSPENDED), [drivers])

  const applyDriverUpdate = (updated) => {
    setDrivers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
  }

  const handleUpdateLicence = async (id, newExpiry) => {
    const updated = await updateDriver(id, { licenceExpiry: newExpiry })
    applyDriverUpdate(updated)
    toast.success('Licence expiry updated.')
  }

  const handleReactivate = async (id) => {
    const updated = await updateDriverStatus(id, DRIVER_STATUS.AVAILABLE)
    applyDriverUpdate(updated)
    toast.success('Driver reactivated.')
  }

  const handleSuspend = async (id) => {
    const updated = await updateDriverStatus(id, DRIVER_STATUS.SUSPENDED)
    applyDriverUpdate(updated)
    toast.success('Driver suspended.')
  }

  const handleRecordIncident = (incident) => {
    const id = `INC-${String(incidents.length + 1).padStart(3, '0')}`
    setIncidents((prev) => [{ id, status: 'under_review', ...incident }, ...prev])
    toast.success('Incident recorded.')
  }

  const handleUpdateViolation = (id, status) => {
    setViolations((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)))
    toast.success('Violation updated.')
  }

  return (
    <div className="space-y-4">
      <Tabs tabs={TABS} active={active} onChange={setActive} />

      {loading ? (
        <Card>
          <TableSkeleton rows={5} cols={4} />
        </Card>
      ) : (
        <>
          {active === 'expiring' && (
            <ExpiringLicencesPanel drivers={expiringDrivers} onUpdateLicence={handleUpdateLicence} />
          )}
          {active === 'expired' && (
            <ExpiredLicencesPanel drivers={expiredDrivers} onUpdateLicence={handleUpdateLicence} />
          )}
          {active === 'suspended' && (
            <SuspendedDriversPanel drivers={suspendedDrivers} onReactivate={handleReactivate} />
          )}
          {active === 'incidents' && (
            <SafetyIncidentsPanel
              incidents={incidents}
              drivers={drivers}
              onRecordIncident={handleRecordIncident}
              onSuspendDriver={handleSuspend}
            />
          )}
          {active === 'violations' && (
            <SafetyViolationsPanel
              violations={violations}
              drivers={drivers}
              onUpdateViolation={handleUpdateViolation}
            />
          )}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Expiring Licences
// ---------------------------------------------------------------------------
function ExpiringLicencesPanel({ drivers, onUpdateLicence }) {
  const [editing, setEditing] = useState(null)

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Expiring Licences</CardTitle>
          <CardDescription>Driving licences expiring within the next 60 days.</CardDescription>
        </div>
      </CardHeader>
      {drivers.length === 0 ? (
        <EmptyState title="No licences expiring soon" />
      ) : (
        <TableContainer className="rounded-none border-none shadow-none">
          <THead>
            <TR>
              <TH>Driver</TH>
              <TH>Licence Number</TH>
              <TH>Expiry Date</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {drivers.map((d) => (
              <TR key={d.id}>
                <TD>{d.name}</TD>
                <TD>{d.licenceNumber}</TD>
                <TD>{formatDate(d.licenceExpiry)}</TD>
                <TD>
                  <StatusBadge status="expiring" label="Expiring Soon" />
                </TD>
                <TD>
                  <PermissionGate module={MODULES.COMPLIANCE} action={ACTIONS.UPDATE_LICENCE}>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(d)}>
                      Update Licence
                    </Button>
                  </PermissionGate>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableContainer>
      )}

      <UpdateLicenceModal driver={editing} onClose={() => setEditing(null)} onSave={onUpdateLicence} />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Expired Licences
// ---------------------------------------------------------------------------
function ExpiredLicencesPanel({ drivers, onUpdateLicence }) {
  const [editing, setEditing] = useState(null)

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Expired Licences</CardTitle>
          <CardDescription>Drivers whose licences have already expired.</CardDescription>
        </div>
      </CardHeader>
      {drivers.length === 0 ? (
        <EmptyState title="No expired licences" />
      ) : (
        <TableContainer className="rounded-none border-none shadow-none">
          <THead>
            <TR>
              <TH>Driver</TH>
              <TH>Licence Number</TH>
              <TH>Expiry Date</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {drivers.map((d) => (
              <TR key={d.id}>
                <TD>{d.name}</TD>
                <TD>{d.licenceNumber}</TD>
                <TD>{formatDate(d.licenceExpiry)}</TD>
                <TD>
                  <StatusBadge status="expired" />
                </TD>
                <TD>
                  <PermissionGate module={MODULES.COMPLIANCE} action={ACTIONS.UPDATE_LICENCE}>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(d)}>
                      Update Licence
                    </Button>
                  </PermissionGate>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableContainer>
      )}

      <UpdateLicenceModal driver={editing} onClose={() => setEditing(null)} onSave={onUpdateLicence} />
    </Card>
  )
}

function UpdateLicenceModal({ driver, onClose, onSave }) {
  const [expiry, setExpiry] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpiry(driver?.licenceExpiry ?? '')
  }, [driver])

  const handleSave = async () => {
    if (!driver || !expiry) return
    setSaving(true)
    try {
      await onSave(driver.id, expiry)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!driver}
      onClose={onClose}
      title="Update Licence"
      description={driver ? `${driver.name} — ${driver.licenceNumber}` : ''}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!expiry}>
            Save
          </Button>
        </>
      }
    >
      <Field label="New Licence Expiry Date" required>
        <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
      </Field>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Suspended Drivers
// ---------------------------------------------------------------------------
function SuspendedDriversPanel({ drivers, onReactivate }) {
  const [confirming, setConfirming] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!confirming) return
    setLoading(true)
    try {
      await onReactivate(confirming.id)
      setConfirming(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Suspended Drivers</CardTitle>
          <CardDescription>Drivers currently suspended from active duty.</CardDescription>
        </div>
      </CardHeader>
      {drivers.length === 0 ? (
        <EmptyState title="No suspended drivers" />
      ) : (
        <TableContainer className="rounded-none border-none shadow-none">
          <THead>
            <TR>
              <TH>Driver</TH>
              <TH>Licence Number</TH>
              <TH>Region</TH>
              <TH>Safety Score</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {drivers.map((d) => (
              <TR key={d.id}>
                <TD>{d.name}</TD>
                <TD>{d.licenceNumber}</TD>
                <TD>{d.region}</TD>
                <TD>{d.safetyScore}</TD>
                <TD>
                  <PermissionGate module={MODULES.COMPLIANCE} action={ACTIONS.REACTIVATE}>
                    <Button size="sm" variant="secondary" onClick={() => setConfirming(d)}>
                      Reactivate
                    </Button>
                  </PermissionGate>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableContainer>
      )}

      <ConfirmDialog
        open={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={handleConfirm}
        loading={loading}
        tone="default"
        title="Reactivate driver?"
        description={confirming ? `${confirming.name} will be marked available for assignment.` : ''}
        confirmLabel="Reactivate"
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Safety Incidents
// ---------------------------------------------------------------------------
function SafetyIncidentsPanel({ incidents, drivers, onRecordIncident, onSuspendDriver }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirming, setConfirming] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleConfirmSuspend = async () => {
    if (!confirming) return
    setLoading(true)
    try {
      await onSuspendDriver(confirming.driverId)
      setConfirming(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Safety Incidents</CardTitle>
          <CardDescription>Recorded driver / vehicle safety incidents.</CardDescription>
        </div>
        <PermissionGate module={MODULES.COMPLIANCE} action={ACTIONS.RECORD_INCIDENT}>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Record Incident
          </Button>
        </PermissionGate>
      </CardHeader>
      {incidents.length === 0 ? (
        <EmptyState title="No safety incidents recorded" />
      ) : (
        <TableContainer className="rounded-none border-none shadow-none">
          <THead>
            <TR>
              <TH>Driver</TH>
              <TH>Vehicle</TH>
              <TH>Type</TH>
              <TH>Severity</TH>
              <TH>Date</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {incidents.map((inc) => {
              const driver = drivers.find((d) => d.id === inc.driverId)
              const vehicle = VEHICLES.find((v) => v.id === inc.vehicleId)
              return (
                <TR key={inc.id}>
                  <TD>{driver?.name ?? inc.driverId}</TD>
                  <TD>{vehicle?.registration ?? inc.vehicleId}</TD>
                  <TD>{inc.type}</TD>
                  <TD>
                    <StatusBadge status={inc.severity} label={INCIDENT_SEVERITY_LABELS[inc.severity] ?? inc.severity} />
                  </TD>
                  <TD>{formatDate(inc.date)}</TD>
                  <TD>
                    <StatusBadge status={inc.status} />
                  </TD>
                  <TD>
                    {driver?.status !== DRIVER_STATUS.SUSPENDED && (
                      <PermissionGate module={MODULES.COMPLIANCE} action={ACTIONS.SUSPEND}>
                        <Button size="sm" variant="dangerOutline" onClick={() => setConfirming(inc)}>
                          Suspend Driver
                        </Button>
                      </PermissionGate>
                    )}
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </TableContainer>
      )}

      <RecordIncidentModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={onRecordIncident} drivers={drivers} />

      <ConfirmDialog
        open={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={handleConfirmSuspend}
        loading={loading}
        tone="danger"
        title="Suspend driver?"
        description={
          confirming
            ? `${drivers.find((d) => d.id === confirming.driverId)?.name ?? confirming.driverId} will be suspended from active duty.`
            : ''
        }
        confirmLabel="Suspend"
      />
    </Card>
  )
}

function RecordIncidentModal({ open, onClose, onSave, drivers }) {
  const emptyForm = { driverId: '', vehicleId: '', type: '', severity: 'low', date: '', description: '' }
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setForm(emptyForm)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const isValid = form.driverId && form.vehicleId && form.type && form.severity && form.date

  const handleSave = async () => {
    if (!isValid) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Safety Incident"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!isValid}>
            Record Incident
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Driver" required>
          <Select value={form.driverId} onChange={update('driverId')}>
            <option value="">Select driver</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Vehicle" required>
          <Select value={form.vehicleId} onChange={update('vehicleId')}>
            <option value="">Select vehicle</option>
            {VEHICLES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Incident Type" required>
          <Input value={form.type} onChange={update('type')} placeholder="e.g. Speeding violation" />
        </Field>
        <Field label="Severity" required>
          <Select value={form.severity} onChange={update('severity')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </Field>
        <Field label="Date" required>
          <Input type="date" value={form.date} onChange={update('date')} />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Description">
          <Textarea rows={3} value={form.description} onChange={update('description')} placeholder="Details of the incident..." />
        </Field>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Safety Violations
// ---------------------------------------------------------------------------
function SafetyViolationsPanel({ violations, drivers, onUpdateViolation }) {
  const [editing, setEditing] = useState(null)
  const [status, setStatus] = useState('open')
  const [saving, setSaving] = useState(false)

  const openEdit = (v) => {
    setEditing(v)
    setStatus(v.status)
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await onUpdateViolation(editing.id, status)
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Safety Violations</CardTitle>
          <CardDescription>Policy violations raised against drivers.</CardDescription>
        </div>
      </CardHeader>
      {violations.length === 0 ? (
        <EmptyState title="No safety violations" />
      ) : (
        <TableContainer className="rounded-none border-none shadow-none">
          <THead>
            <TR>
              <TH>Driver</TH>
              <TH>Description</TH>
              <TH>Raised On</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {violations.map((v) => {
              const driver = drivers.find((d) => d.id === v.driverId)
              return (
                <TR key={v.id}>
                  <TD>{driver?.name ?? v.driverId}</TD>
                  <TD className="whitespace-normal">{v.description}</TD>
                  <TD>{formatDate(v.raisedOn)}</TD>
                  <TD>
                    <StatusBadge status={v.status} />
                  </TD>
                  <TD>
                    <PermissionGate module={MODULES.COMPLIANCE} action={ACTIONS.UPDATE_VIOLATION}>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(v)}>
                        Update
                      </Button>
                    </PermissionGate>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </TableContainer>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Update Violation"
        description={editing?.description}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </Select>
        </Field>
      </Modal>
    </Card>
  )
}
