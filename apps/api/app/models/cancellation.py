import uuid
from datetime import datetime
from sqlalchemy import Column, String, Date, DateTime, Text, ForeignKey, Index
from app.database import Base

class CancellationCase(Base):
    __tablename__ = "cancellation_cases"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    stream_id = Column(String(64), ForeignKey("recurring_streams.id"), index=True, nullable=False)
    
    # Status: 'started', 'submitted', 'reminder_set', 'verified_stopped'
    status = Column(String(50), default="started", nullable=False)
    cancellation_channel = Column(String(50), default="web", nullable=False)  # web, app_store, google_play, email
    notes = Column(Text, nullable=True)
    reminder_date = Column(Date, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    verified_stopped_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_cancellation_user_stream", "user_id", "stream_id"),
    )
