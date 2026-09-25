import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, BigInteger, Date, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base

class FinancialAccount(Base):
    __tablename__ = "financial_accounts"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String(255), default="Primary Account", nullable=False)
    account_type = Column(String(50), default="bank", nullable=False)  # bank, credit_card, wallet
    currency = Column(String(3), default="INR", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")


class ImportBatch(Base):
    __tablename__ = "imports"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    status = Column(String(50), default="completed")  # queued, processing, completed, failed
    total_rows = Column(Integer, default=0)
    imported_rows = Column(Integer, default=0)
    duplicate_rows = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    transactions = relationship("Transaction", back_populates="import_batch", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    account_id = Column(String(64), ForeignKey("financial_accounts.id"), nullable=True)
    import_id = Column(String(64), ForeignKey("imports.id"), nullable=True)
    
    transaction_date = Column(Date, index=True, nullable=False)
    amount_minor = Column(BigInteger, nullable=False)  # Stored in minor currency units (paise/cents), e.g. 49900
    currency_code = Column(String(3), default="INR", nullable=False)
    direction = Column(String(10), default="debit", nullable=False)  # debit or credit
    
    raw_description = Column(Text, nullable=False)
    normalized_description = Column(String(255), nullable=False)
    merchant_name = Column(String(255), nullable=False)
    merchant_key = Column(String(255), index=True, nullable=False)  # Canonical lowercased slug
    category = Column(String(100), default="Uncategorized", nullable=False)
    payment_rail = Column(String(50), nullable=True)  # UPI, Card, NetBanking, ACH, etc.
    
    is_duplicate = Column(Boolean, default=False, nullable=False)
    fingerprint = Column(String(64), index=True, nullable=False)  # sha256 of user_id+date+amount+normalized_desc
    metadata_json = Column(Text, default="{}", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    account = relationship("FinancialAccount", back_populates="transactions")
    import_batch = relationship("ImportBatch", back_populates="transactions")

    __table_args__ = (
        Index("ix_transactions_user_date", "user_id", "transaction_date"),
        Index("ix_transactions_user_merchant", "user_id", "merchant_key"),
    )
