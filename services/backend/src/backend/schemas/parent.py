from pydantic import BaseModel, EmailStr, field_validator


class ParentCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("phone must not be empty")
        return v


class ParentResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str

    model_config = {"from_attributes": True}
