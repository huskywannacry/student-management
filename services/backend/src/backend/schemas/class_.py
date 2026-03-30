import re

from pydantic import BaseModel, field_validator

VALID_DAYS = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]
TIME_SLOT_RE = re.compile(r"^\d{2}:\d{2}-\d{2}:\d{2}$")


class ClassCreate(BaseModel):
    name: str
    subject: str
    day_of_week: str
    time_slot: str
    teacher_name: str
    max_students: int

    @field_validator("day_of_week")
    @classmethod
    def validate_day(cls, v: str) -> str:
        if v not in VALID_DAYS:
            raise ValueError(f"day_of_week must be one of {VALID_DAYS}")
        return v

    @field_validator("time_slot")
    @classmethod
    def validate_time_slot(cls, v: str) -> str:
        if not TIME_SLOT_RE.match(v):
            raise ValueError("time_slot must be in format HH:MM-HH:MM, e.g. '08:00-10:00'")
        return v

    @field_validator("max_students")
    @classmethod
    def validate_max_students(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("max_students must be a positive integer")
        return v


class ClassResponse(BaseModel):
    id: int
    name: str
    subject: str
    day_of_week: str
    time_slot: str
    teacher_name: str
    max_students: int

    model_config = {"from_attributes": True}
