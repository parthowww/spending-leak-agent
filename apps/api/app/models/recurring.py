import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, BigInteger, Float, Date, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base

class RecurringStream(Base):
    __tablename__ = "recurring_streams"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    account_id = Column(String(64), ForeignKey("financial_accounts.id"), nullable=True)
    
    merchant_name = Column(String(255), nullable=False)
    merchant_key = Column(String(255), index=True, nullable=False)
    category = Column(String(100), default="Subscription", nullable=False)
    stream_type = Column(String(50), default="subscription", nullable=False)  # subscription, recurring_bill, installment, membership
    
    frequency = Column(String(30), default="monthly", nullable=False)  # weekly, biweekly, monthly, quarterly, semiannual, annual
    expected_interval_days = Column(Float, default=30.4, nullable=False)
    
    amount_minor = Column(BigInteger, nullable=False)  # Median amount in minor currency units
    min_amount_minor = Column(BigInteger, nullable=False)
    max_amount_minor = Column(BigInteger, nullable=False)
    currency_code = Column(String(3), default="INR", nullable=False)
    
    first_seen_at = Column(Date, nullable=False)
    last_seen_at = Column(Date, nullable=False)
    predicted_next_charge_at = Column(Date, nullable=False)
    occurrence_count = Column(Integer, default=1, nullable=False)
    
    confidence_score = Column(Float, default=0.0, nullable=False)  # 0.00 to 1.00
    leak_score = Column(Float, default=0.0, nullable=False)  # Priority score for potential waste
    annualized_cost_minor = Column(BigInteger, nullable=False)
    
    # User Action State: detected, keep, review, cancelled, not_subscription, remind_later
    user_status = Column(String(50), default="detected", nullable=False)
    detection_reason = Column(Text, nullable=False)
    evidence_json = Column(Text, default="{}", nullable=False)
    
    reminder_date = Column(Date, nullable=True)
    cancellation_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    stream_transactions = relationship("RecurringStreamTransaction", back_populates="stream", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_recurring_user_status", "user_id", "user_status"),
        Index("ix_recurring_user_merchant", "user_id", "merchant_key"),
    )


class RecurringStreamTransaction(Base):
    __tablename__ = "recurring_stream_transactions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    stream_id = Column(String(64), ForeignKey("recurring_streams.id"), index=True, nullable=False)
    transaction_id = Column(String(64), ForeignKey("transactions.id"), index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    stream = relationship("RecurringStream", back_populates="stream_transactions")
    transaction = relationship("Transaction")
