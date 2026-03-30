from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.parent import Parent
from backend.schemas.parent import ParentCreate, ParentResponse

router = APIRouter(prefix="/api/parents", tags=["parents"])


@router.get("", response_model=list[ParentResponse])
def list_parents(db: Session = Depends(get_db)):
    return db.query(Parent).all()


@router.post("", response_model=ParentResponse, status_code=status.HTTP_201_CREATED)
def create_parent(parent: ParentCreate, db: Session = Depends(get_db)):
    existing = db.query(Parent).filter(Parent.email == parent.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A parent with this email already exists",
        )
    db_parent = Parent(**parent.model_dump())
    db.add(db_parent)
    db.commit()
    db.refresh(db_parent)
    return db_parent


@router.get("/{parent_id}", response_model=ParentResponse)
def get_parent(parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    if not parent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent not found")
    return parent
