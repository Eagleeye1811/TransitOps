import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Unlock, UserCheck, UserX, UserCog } from 'lucide-react'
import { Button, IconButton } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { RoleBadge } from '@/components/layout/RoleBadge'
import { Select } from '@/components/common/FormControls'
import { SearchInput } from '@/components/common/SearchInput'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { TableContainer, THead, TBody, TR, TH, TD } from '@/components/common/Table'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { TableSkeleton } from '@/components/common/Skeleton'
import { Tooltip } from '@/components/common/Tooltip'
import { UserForm } from '@/components/settings/UserForm'
import { ROLE_LIST, ROLE_LABELS } from '@/config/roles'
import { formatDateTime, initials } from '@/utils/formatters'
import { useToast } from '@/hooks/useToast'
import { getUsers, createUser, updateUser, setUserStatus, resetAccount } from '@/services/userService'

const PAGE_SIZE = 8

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'locked', label: 'Locked' },
]

const STATUS_BADGE_COLOR = { active: 'green', inactive: 'gray', locked: 'amber' }
const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s.label]))

export default function UserManagementPage() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  // null | 'create' | <user object being edited>
  const [formModal, setFormModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [statusDialog, setStatusDialog] = useState(null) // { user, nextStatus }
  const [resetDialog, setResetDialog] = useState(null) // user
  const [dialogLoading, setDialogLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [search, roleFilter, statusFilter])

  function loadUsers() {
    setLoading(true)
    return getUsers().then((data) => {
      setUsers(data)
      setLoading(false)
    })
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchesRole = !roleFilter || u.role === roleFilter
      const matchesStatus = !statusFilter || u.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const total = filtered.length
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const editingUser = formModal && formModal !== 'create' ? formModal : null
  const isFormOpen = formModal !== null

  async function handleCreate(values) {
    setSubmitting(true)
    try {
      await createUser({
        name: values.name,
        email: values.email,
        role: values.role,
        phone: values.phone,
        region: values.region,
      })
      toast.success('User added successfully.')
      setFormModal(null)
      await loadUsers()
    } catch {
      toast.error('Could not add user. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(values) {
    if (!editingUser) return
    setSubmitting(true)
    try {
      await updateUser(editingUser.id, {
        name: values.name,
        email: values.email,
        role: values.role,
        phone: values.phone,
        region: values.region,
        status: values.status,
      })
      toast.success('User updated successfully.')
      setFormModal(null)
      await loadUsers()
    } catch {
      toast.error('Could not update user. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmStatusChange() {
    if (!statusDialog) return
    setDialogLoading(true)
    try {
      await setUserStatus(statusDialog.user.id, statusDialog.nextStatus)
      toast.success(
        `${statusDialog.user.name} is now ${statusDialog.nextStatus === 'active' ? 'active' : 'inactive'}.`
      )
      setStatusDialog(null)
      await loadUsers()
    } catch {
      toast.error('Could not update user status.')
    } finally {
      setDialogLoading(false)
    }
  }

  async function confirmReset() {
    if (!resetDialog) return
    setDialogLoading(true)
    try {
      await resetAccount(resetDialog.id)
      toast.success(`${resetDialog.name}'s account has been unlocked.`)
      setResetDialog(null)
      await loadUsers()
    } catch {
      toast.error('Could not unlock account.')
    } finally {
      setDialogLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <UserCog className="size-4.5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500">Manage accounts, roles and access status.</p>
          </div>
        </div>
        <Button onClick={() => setFormModal('create')}>
          <Plus className="size-4" />
          Add User
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" className="sm:w-72" />
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="sm:w-48">
          <option value="">All roles</option>
          {ROLE_LIST.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <TableSkeleton rows={8} cols={6} />
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No users found"
          description="Try adjusting your search or filters, or add a new user."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <TableContainer className="rounded-none border-0 shadow-none">
            <THead>
              <TR>
                <TH>User</TH>
                <TH>Role</TH>
                <TH>Region</TH>
                <TH>Status</TH>
                <TH>Last Login</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {paged.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                          u.avatarColor ?? 'bg-brand-600'
                        } text-xs font-semibold text-white`}
                      >
                        {initials(u.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <RoleBadge role={u.role} />
                  </TD>
                  <TD>{u.region || '—'}</TD>
                  <TD>
                    <Badge color={STATUS_BADGE_COLOR[u.status] ?? 'gray'}>{STATUS_LABEL[u.status] ?? u.status}</Badge>
                  </TD>
                  <TD>{formatDateTime(u.lastLogin)}</TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content="Edit user">
                        <IconButton aria-label="Edit user" onClick={() => setFormModal(u)}>
                          <Pencil className="size-4" />
                        </IconButton>
                      </Tooltip>

                      {u.status === 'locked' ? (
                        <Tooltip content="Unlock account">
                          <IconButton aria-label="Unlock account" onClick={() => setResetDialog(u)}>
                            <Unlock className="size-4" />
                          </IconButton>
                        </Tooltip>
                      ) : u.status === 'active' ? (
                        <Tooltip content="Deactivate user">
                          <IconButton
                            aria-label="Deactivate user"
                            onClick={() => setStatusDialog({ user: u, nextStatus: 'inactive' })}
                          >
                            <UserX className="size-4" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Activate user">
                          <IconButton
                            aria-label="Activate user"
                            onClick={() => setStatusDialog({ user: u, nextStatus: 'active' })}
                          >
                            <UserCheck className="size-4" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </TableContainer>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </div>
      )}

      <Modal
        open={isFormOpen}
        onClose={() => setFormModal(null)}
        title={editingUser ? 'Edit user' : 'Add user'}
        description={editingUser ? 'Update account details, role or status.' : 'Create a new user account.'}
      >
        <UserForm
          key={editingUser ? editingUser.id : 'create'}
          initialValues={editingUser ?? undefined}
          isEdit={!!editingUser}
          submitting={submitting}
          onCancel={() => setFormModal(null)}
          onSubmit={editingUser ? handleUpdate : handleCreate}
        />
      </Modal>

      <ConfirmDialog
        open={!!statusDialog}
        onClose={() => setStatusDialog(null)}
        onConfirm={confirmStatusChange}
        loading={dialogLoading}
        tone={statusDialog?.nextStatus === 'inactive' ? 'danger' : 'default'}
        title={statusDialog?.nextStatus === 'inactive' ? 'Deactivate user?' : 'Activate user?'}
        description={
          statusDialog
            ? `${statusDialog.user.name} will ${
                statusDialog.nextStatus === 'inactive'
                  ? 'lose access to TransitOps until reactivated.'
                  : 'regain access to TransitOps.'
              }`
            : undefined
        }
        confirmLabel={statusDialog?.nextStatus === 'inactive' ? 'Deactivate' : 'Activate'}
      />

      <ConfirmDialog
        open={!!resetDialog}
        onClose={() => setResetDialog(null)}
        onConfirm={confirmReset}
        loading={dialogLoading}
        tone="default"
        title="Unlock account?"
        description={resetDialog ? `${resetDialog.name}'s account will be reset to active status.` : undefined}
        confirmLabel="Unlock"
      />
    </div>
  )
}
