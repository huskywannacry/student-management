from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.class_ import Class
from backend.models.registration import ClassRegistration
from backend.models.subscription import Subscription
from backend.schemas.registration import CancelResponse, RegistrationCreate, RegistrationResponse
from backend.utils import is_within_24h, slots_overlap

router = APIRouter(prefix="/api", tags=["registrations"])


@router.post(
    "/classes/{class_id}/register",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_student(
    class_id: int,
    body: RegistrationCreate,
    db: Session = Depends(get_db),
):
    # 1. Verify class exists
    class_ = db.query(Class).filter(Class.id == class_id).first()
    if not class_:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    # 2. Check max capacity
    current_count = (
        db.query(ClassRegistration).filter(ClassRegistration.class_id == class_id).count()
    )
    if current_count >= class_.max_students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Class is full (max {class_.max_students} students)",
        )

    # 3. Check if student is already registered in this class
    duplicate = (
        db.query(ClassRegistration)
        .filter(
            ClassRegistration.class_id == class_id,
            ClassRegistration.student_id == body.student_id,
        )
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already registered in this class",
        )

    # 4. Check time-slot conflicts with the student's existing registrations
    existing_regs = (
        db.query(ClassRegistration)
        .filter(ClassRegistration.student_id == body.student_id)
        .all()
    )
    for reg in existing_regs:
        existing_class = db.query(Class).filter(Class.id == reg.class_id).first()
        if (
            existing_class
            and existing_class.day_of_week == class_.day_of_week
            and slots_overlap(existing_class.time_slot, class_.time_slot)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Time slot conflict with class '{existing_class.name}' "
                    f"({existing_class.day_of_week} {existing_class.time_slot})"
                ),
            )

    # 5. Check active subscription with remaining sessions
    today = date.today()
    subscription = (
        db.query(Subscription)
        .filter(
            Subscription.student_id == body.student_id,
            Subscription.end_date >= today,
            Subscription.used_sessions < Subscription.total_sessions,
        )
        .first()
    )
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student has no active subscription with remaining sessions",
        )

    # 6. Consume one session and create registration
    subscription.used_sessions += 1
    registration = ClassRegistration(class_id=class_id, student_id=body.student_id)
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


@router.delete("/registrations/{registration_id}", response_model=CancelResponse)
def cancel_registration(registration_id: int, db: Session = Depends(get_db)):
    registration = (
        db.query(ClassRegistration)
        .filter(ClassRegistration.id == registration_id)
        .first()
    )
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found"
        )

    class_ = db.query(Class).filter(Class.id == registration.class_id).first()
    within_24h = is_within_24h(class_.day_of_week, class_.time_slot)

    session_refunded = False
    if not within_24h:
        # Refund 1 session to the student's most recent active subscription
        today = date.today()
        subscription = (
            db.query(Subscription)
            .filter(
                Subscription.student_id == registration.student_id,
                Subscription.end_date >= today,
                Subscription.used_sessions > 0,
            )
            .order_by(Subscription.end_date.desc())
            .first()
        )
        if subscription:
            subscription.used_sessions -= 1
            session_refunded = True

    db.delete(registration)
    db.commit()
    return CancelResponse(
        message="Registration cancelled successfully",
        session_refunded=session_refunded,
    )
