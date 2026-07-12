"""Status/category string constants — ports of the enum-like exports in
frontend/src/data/*.js. Stored as plain TEXT columns (not Postgres ENUM
types) so new values never require a migration, matching the frontend's
own "just a string" approach.
"""


class UserStatus:
    ACTIVE = "active"
    INACTIVE = "inactive"
    LOCKED = "locked"


class VehicleStatus:
    AVAILABLE = "available"
    ON_TRIP = "on_trip"
    IN_SHOP = "in_shop"
    RETIRED = "retired"


class DriverStatus:
    AVAILABLE = "available"
    ON_TRIP = "on_trip"
    OFF_DUTY = "off_duty"
    SUSPENDED = "suspended"


class TripStatus:
    DRAFT = "draft"
    DISPATCHED = "dispatched"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MaintenanceStatus:
    SCHEDULED = "scheduled"
    IN_SHOP = "in_shop"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class IncidentSeverity:
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class NotificationType:
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
