class DomainError(Exception):
    """Base for business-rule errors that map to a 4xx response."""

    status_code = 400

    def __init__(self, errors: list[str] | str):
        self.errors = errors if isinstance(errors, list) else [errors]
        super().__init__("; ".join(self.errors))


class NotFoundError(DomainError):
    status_code = 404


class ValidationFailedError(DomainError):
    """Accumulate-all-errors validation failure — mirrors the frontend's
    `{ isValid, errors: string[] }` contract from validators.js.
    """

    status_code = 422
