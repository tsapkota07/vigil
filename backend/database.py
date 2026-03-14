from sqlalchemy import create_engine, Integer, Column, String, Float, DateTime, Text
from sqlalchemy.orm import declarative_base, Session
import datetime

DATABASE_URL = "sqlite:///./vigil.db"
engine =  create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base = declarative_base()

class AuditResult(Base):
    __tablename__ = "audit_results"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    performance_score = Column(Float)
    seo_score = Column(Float)
    accessibility_score = Column(Float)
    security_score = Column(Float)
    overall_score = Column(Float)
    issues = Column(Text)                # JSON data 
    ai_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ScheduledAudit(Base):
    __tablename__ = "scheduled_audits"
 
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    interval_hours = Column(Integer, default=6)
    alert_email = Column(String, nullable=True)
    alert_threshold = Column(Float, default=70.0)  # email now
    is_active = Column(Integer, default=1)          # 1 = active, 0 = paused
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_run_at = Column(DateTime, nullable=True)
 
 
# Create all tables
Base.metadata.create_all(engine)
 
 
def get_session():
    return Session(engine)