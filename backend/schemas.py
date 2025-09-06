from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from backend.models import Contest
import json


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenIn(BaseModel):
    token: str


class ResendEmailIn(BaseModel):
    email: EmailStr


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None
    provider: str
    role: str
    email_confirmed: bool  # Adicionado para retornar o status de confirmação

    class Config:
        from_attributes = True


# --- Contest Schemas ---

class ContestBase(BaseModel):
    name: str
    banca: str
    site: str
    edital_url: str
    cargo: str


class ContestCreate(ContestBase):
    pass


class Contest(ContestBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Contest Result Schemas ---

# 1. Definições Base
class ContestResultBase(BaseModel):
    contest_id: int
    category: str  # 'Ampla', 'PPP', 'PCD', 'Indígenas'
    position: int
    name: str
    final_score: float


class ContestResultExtraBase(BaseModel):
    situacao: Optional[str] = None
    vai_assumir: Optional[str] = None
    outras_listas: Optional[Dict[str, Any]] = None
    contatos: Optional[Dict[str, Any]] = None

    @field_validator("outras_listas", "contatos", mode="before")
    def parse_json(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return None
        return v


# 2. Schemas de Criação/Update
class ContestResultCreate(BaseModel):
    contest_id: int
    category: str
    names: List[str]
    final_scores: List[float]


class ContestResultExtraCreate(ContestResultExtraBase):
    contest_result_id: int


class ContestResultExtraUpdate(ContestResultExtraBase):
    pass


# 3. Schemas Completos (usados em respostas da API)
class ContestResultExtra(ContestResultExtraBase):
    id: int
    contest_result_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContestResult(ContestResultBase):
    id: int
    created_at: datetime

    contest: Contest
    extra: Optional[ContestResultExtra] = None

    class Config:
        from_attributes = True

class NamesBatchRequest(BaseModel):
    names: List[str]


















