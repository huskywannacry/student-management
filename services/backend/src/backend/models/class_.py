from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from backend.database import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    # "Monday" | "Tuesday" | ... | "Sunday"
    day_of_week = Column(String(20), nullable=False)
    # format: "HH:MM-HH:MM", e.g. "08:00-10:00"
    time_slot = Column(String(20), nullable=False)
    teacher_name = Column(String(255), nullable=False)
    max_students = Column(Integer, nullable=False)

    registrations = relationship("ClassRegistration", back_populates="class_")
