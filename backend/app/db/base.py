"""Single import point so Alembic's autogenerate (and anything else that
needs SQLModel.metadata) sees every table. Import this module, not the
individual model files, whenever the full metadata is needed.
"""

from sqlmodel import SQLModel

from app.models.activity import ActivityLog  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.driver import Driver  # noqa: F401
from app.models.expense import Expense  # noqa: F401
from app.models.fuel_log import FuelLog  # noqa: F401
from app.models.id_counter import IdCounter  # noqa: F401
from app.models.maintenance import MaintenanceRecord  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.org_settings import OrgSettings  # noqa: F401
from app.models.safety import SafetyIncident, SafetyViolation  # noqa: F401
from app.models.trip import Trip  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.vehicle import Vehicle  # noqa: F401

metadata = SQLModel.metadata
