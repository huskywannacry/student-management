from datetime import datetime

from pydantic import BaseModel


class RegistrationCreate(BaseModel):
    student_id: int


class RegistrationResponse(BaseModel):
    id: int
    class_id: int
    student_id: int
    registered_at: datetime

    model_config = {"from_attributes": True}


class CancelResponse(BaseModel):
    message: str
    session_refunded: bool
