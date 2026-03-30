import enum
from datetime import date

from pydantic import BaseModel


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class ParentInfo(BaseModel):
    id: int
    name: str
    phone: str
    email: str

    model_config = {"from_attributes": True}


class StudentCreate(BaseModel):
    name: str
    dob: date
    gender: GenderEnum
    current_grade: str
    parent_id: int


class StudentResponse(BaseModel):
    id: int
    name: str
    dob: date
    gender: GenderEnum
    current_grade: str
    parent_id: int
    parent: ParentInfo

    model_config = {"from_attributes": True}
