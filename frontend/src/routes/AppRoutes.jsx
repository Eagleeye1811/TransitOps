import { Routes, Route, Navigate } from 'react-router-dom'
import { RequireAuth, RequireModule } from './ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { MODULES, ACTIONS } from '@/config/permissions'

import LoginPage from '@/pages/LoginPage'
import ProfilePage from '@/pages/ProfilePage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import NotFoundPage from '@/pages/NotFoundPage'
import DashboardPage from '@/pages/DashboardPage'

import FleetListPage from '@/pages/FleetListPage'
import VehicleDetailsPage from '@/pages/VehicleDetailsPage'
import VehicleFormPage from '@/pages/VehicleFormPage'

import DriversListPage from '@/pages/DriversListPage'
import DriverDetailsPage from '@/pages/DriverDetailsPage'
import DriverFormPage from '@/pages/DriverFormPage'

import TripsListPage from '@/pages/TripsListPage'
import TripDetailsPage from '@/pages/TripDetailsPage'
import TripFormPage from '@/pages/TripFormPage'

import MaintenancePage from '@/pages/MaintenancePage'
import MaintenanceFormPage from '@/pages/MaintenanceFormPage'
import MaintenanceDetailsPage from '@/pages/MaintenanceDetailsPage'

import ExpensesPage from '@/pages/ExpensesPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import CompliancePage from '@/pages/CompliancePage'

import GeneralSettingsPage from '@/pages/settings/GeneralSettingsPage'
import UserManagementPage from '@/pages/settings/UserManagementPage'
import RolesPermissionsPage from '@/pages/settings/RolesPermissionsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Fleet */}
          <Route
            path="/fleet"
            element={
              <RequireModule module={MODULES.FLEET}>
                <FleetListPage />
              </RequireModule>
            }
          />
          <Route
            path="/fleet/new"
            element={
              <RequireModule module={MODULES.FLEET} action={ACTIONS.CREATE}>
                <VehicleFormPage />
              </RequireModule>
            }
          />
          <Route
            path="/fleet/:vehicleId/edit"
            element={
              <RequireModule module={MODULES.FLEET} action={ACTIONS.EDIT}>
                <VehicleFormPage />
              </RequireModule>
            }
          />
          <Route
            path="/fleet/:vehicleId"
            element={
              <RequireModule module={MODULES.FLEET}>
                <VehicleDetailsPage />
              </RequireModule>
            }
          />

          {/* Drivers */}
          <Route
            path="/drivers"
            element={
              <RequireModule module={MODULES.DRIVERS}>
                <DriversListPage />
              </RequireModule>
            }
          />
          <Route
            path="/drivers/new"
            element={
              <RequireModule module={MODULES.DRIVERS} action={ACTIONS.CREATE}>
                <DriverFormPage />
              </RequireModule>
            }
          />
          <Route
            path="/drivers/:driverId/edit"
            element={
              <RequireModule module={MODULES.DRIVERS} action={[ACTIONS.EDIT, ACTIONS.EDIT_OPERATIONAL]}>
                <DriverFormPage />
              </RequireModule>
            }
          />
          <Route
            path="/drivers/:driverId"
            element={
              <RequireModule module={MODULES.DRIVERS}>
                <DriverDetailsPage />
              </RequireModule>
            }
          />

          {/* Trips */}
          <Route
            path="/trips"
            element={
              <RequireModule module={MODULES.TRIPS}>
                <TripsListPage />
              </RequireModule>
            }
          />
          <Route
            path="/trips/new"
            element={
              <RequireModule module={MODULES.TRIPS} action={ACTIONS.CREATE}>
                <TripFormPage />
              </RequireModule>
            }
          />
          <Route
            path="/trips/:tripId/edit"
            element={
              <RequireModule module={MODULES.TRIPS} action={ACTIONS.EDIT}>
                <TripFormPage />
              </RequireModule>
            }
          />
          <Route
            path="/trips/:tripId"
            element={
              <RequireModule module={MODULES.TRIPS}>
                <TripDetailsPage />
              </RequireModule>
            }
          />

          {/* Maintenance */}
          <Route
            path="/maintenance"
            element={
              <RequireModule module={MODULES.MAINTENANCE}>
                <MaintenancePage />
              </RequireModule>
            }
          />
          <Route
            path="/maintenance/new"
            element={
              <RequireModule module={MODULES.MAINTENANCE} action={ACTIONS.CREATE}>
                <MaintenanceFormPage />
              </RequireModule>
            }
          />
          <Route
            path="/maintenance/:maintenanceId"
            element={
              <RequireModule module={MODULES.MAINTENANCE}>
                <MaintenanceDetailsPage />
              </RequireModule>
            }
          />

          {/* Fuel & Expenses */}
          <Route
            path="/expenses"
            element={
              <RequireModule module={MODULES.EXPENSES}>
                <ExpensesPage />
              </RequireModule>
            }
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={
              <RequireModule module={MODULES.ANALYTICS}>
                <AnalyticsPage />
              </RequireModule>
            }
          />

          {/* Compliance */}
          <Route
            path="/compliance"
            element={
              <RequireModule module={MODULES.COMPLIANCE}>
                <CompliancePage />
              </RequireModule>
            }
          />

          {/* Settings (Admin only) */}
          <Route
            path="/settings/general"
            element={
              <RequireModule module={MODULES.SETTINGS}>
                <GeneralSettingsPage />
              </RequireModule>
            }
          />
          <Route
            path="/settings/users"
            element={
              <RequireModule module={MODULES.USERS}>
                <UserManagementPage />
              </RequireModule>
            }
          />
          <Route
            path="/settings/roles"
            element={
              <RequireModule module={MODULES.RBAC}>
                <RolesPermissionsPage />
              </RequireModule>
            }
          />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
