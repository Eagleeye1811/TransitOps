from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central app configuration, read from environment / .env.

    DATABASE_URL defaults to a local SQLite file so the app runs out of the
    box without a Neon account. Set DATABASE_URL to a Neon pooled connection
    string (the "-pooler" host, sslmode=require) to use real Postgres.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "TransitOps API"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = "sqlite:///./dev.db"

    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 12  # 12 hours

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    RESEND_API_KEY: str | None = None
    REMINDER_EMAIL_FROM: str = "TransitOps <alerts@transitops.in>"
    LICENCE_EXPIRY_REMINDER_DAYS: int = 60
    # Demo-only: seeded users have @transitops.in addresses that don't exist,
    # so Resend can't deliver to them. When set, every outgoing email is
    # redirected here instead so the pipeline is demoable end-to-end without
    # a verified sending domain. Leave unset in a real deployment.
    DEMO_RECIPIENT_OVERRIDE: str | None = None

    CLOUDINARY_CLOUD_NAME: str | None = None
    CLOUDINARY_API_KEY: str | None = None
    CLOUDINARY_API_SECRET: str | None = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
