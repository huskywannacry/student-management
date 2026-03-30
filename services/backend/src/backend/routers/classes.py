from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.class_ import Class
from backend.schemas.class_ import ClassCreate, ClassResponse, VALID_DAYS

router = APIRouter(prefix="/api/classes", tags=["classes"])


@router.post("", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
def create_class(class_: ClassCreate, db: Session = Depends(get_db)):
    db_class = Class(**class_.model_dump())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


@router.get("", response_model=list[ClassResponse])
def list_classes(day: Optional[str] = None, db: Session = Depends(get_db)):
    if day and day not in VALID_DAYS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid day. Must be one of {VALID_DAYS}",
        )
    query = db.query(Class)
    if day:
        query = query.filter(Class.day_of_week == day)
    return query.all()
