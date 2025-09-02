from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date
from backend.models import Contest

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
    email_confirmed: bool # Adicionado para retornar o status de confirmação
    
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
    outras_listas: Optional[dict] = None
    contatos: Optional[dict] = None

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
#    Defina 'ContestResultExtra' primeiro, pois 'ContestResult' depende dele.
class ContestResultExtra(ContestResultExtraBase):
    id: int
    contest_result_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

#    Agora defina 'ContestResult', que usa 'Contest' e 'ContestResultExtra'
class ContestResult(ContestResultBase):
    id: int
    created_at: datetime
    
    # Estes tipos agora são conhecidos pelo Python
    contest: Contest 
    extra: Optional[ContestResultExtra] = None 

    class Config:
        from_attributes = True

















