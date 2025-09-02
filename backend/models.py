from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Date, Float, Boolean, CheckConstraint, Index, JSON
from sqlalchemy.sql import func
from backend.database import Base
from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="comum")
    provider = Column(String, default="local")  # local | google
    
    # Novos campos para confirmação de e-mail
    email_confirmed = Column(Boolean, default=False, nullable=False)
    confirmation_token = Column(String, nullable=True)
    confirmation_sent_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Contest(Base):
    __tablename__ = "contests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)       # Nome do Concurso
    banca = Column(String, nullable=False)      # CESPE, FGV, IBFC...
    site = Column(Text, nullable=False)         # URL do site
    edital_url = Column(Text, nullable=False)   # Link do Edital
    cargo = Column(String, nullable=False)      # Analista, Técnico, Professor...
    created_at = Column(DateTime, default=datetime.utcnow)

    results = relationship("ContestResult", back_populates="contest", cascade="all, delete-orphan")

class ContestResult(Base):
    __tablename__ = "contest_results"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contests.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)   # 'Ampla' | 'PPP' | 'PCD' | 'Indígenas'
    position = Column(Integer, nullable=False)  # 1, 2, 3... (por categoria)
    name = Column(String, nullable=False)       # Nome do candidato
    final_score = Column(Float)                 # Nota Final (use ponto: 9.58)
    created_at = Column(DateTime, default=datetime.utcnow)

    contest = relationship("Contest", back_populates="results")
    extra = relationship("ContestResultExtra", back_populates="result", uselist=False)

    __table_args__ = (
        CheckConstraint("category in ('Ampla','PPP','PCD','Indígenas')", name="ck_results_category"),
        UniqueConstraint("contest_id", "category", "position", name="uq_results_contest_cat_pos"),
        Index("idx_results_contest", "contest_id"),
        Index("idx_results_contest_cat_pos", "contest_id", "category", "position"),
    )

class ContestResultExtra(Base):
    __tablename__ = "contest_results_extra"

    id = Column(Integer, primary_key=True, index=True)
    contest_result_id = Column(Integer, ForeignKey("contest_results.id"), nullable=False)

    situacao = Column(String, nullable=True)  # Aguardando Convocação, Convocado, etc.
    vai_assumir = Column(String, nullable=True)  # SIM, TALVEZ, NÃO
    outras_listas = Column(JSON, nullable=True)  # Lista de outros concursos que o candidato está
    contatos = Column(JSON, nullable=True)  # {"email": "...", "telefone": "...", "whatsapp": "..."}

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # ✅ GARANTA QUE ESTA LINHA EXISTA E CORRESPONDA AO 'back_populates' ACIMA
    result = relationship("ContestResult", back_populates="extra")










