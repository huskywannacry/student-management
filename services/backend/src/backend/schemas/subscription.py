from datetime import date

from pydantic import BaseModel, computed_field, field_validator


class SubscriptionCreate(BaseModel):
    student_id: int
    package_name: str
    start_date: date
    end_date: date
    total_sessions: int
    used_sessions: int = 0

    @field_validator("total_sessions")
    @classmethod
    def validate_total_sessions(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("total_sessions must be positive")
        return v

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v: date, info) -> date:
        start = info.data.get("start_date")
        if start and v < start:
            raise ValueError("end_date must be after start_date")
        return v


class SubscriptionResponse(BaseModel):
    id: int
    student_id: int
    package_name: str
    start_date: date
    end_date: date
    total_sessions: int
    used_sessions: int

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def remaining_sessions(self) -> int:
        return self.total_sessions - self.used_sessions
