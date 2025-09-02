from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional
from .. import models, database
import unicodedata

router = APIRouter()

class NamesRequest(BaseModel):
    names: List[str]
    contest_id_atual: Optional[int] = None   # 👈 adiciona o contest_id_atual

def normalizar_nome(nome: str) -> str:
    if not nome:
        return ""
    nome = nome.lower()
    nome = unicodedata.normalize('NFD', nome)
    nome = "".join(c for c in nome if unicodedata.category(c) != 'Mn')
    return nome.strip()

@router.post("/results-by-names")
def get_results_by_names(request: NamesRequest, db: Session = Depends(database.get_db)):
    """
    Recebe uma lista de nomes e retorna se cada nome está
    'nomeado' ou 'empossado' em alguma outra lista (ignora a lista atual).
    """
    resultados = {}
    nomes_normalizados = {nome: normalizar_nome(nome) for nome in request.names}

    # Puxa todos os resultados de uma vez só
    todos_resultados = db.query(models.ContestResult).all()

    for nome_original, nome_norm in nomes_normalizados.items():
        participacoes = [
            r for r in todos_resultados if normalizar_nome(r.name) == nome_norm
        ]

        temPositivo = False
        for r in participacoes:
            # 👇 ignora a lista atual
            if request.contest_id_atual and r.contest_id == request.contest_id_atual:
                continue

            if hasattr(r, "extra") and r.extra:
                sit = (r.extra.situacao or "").lower()
                if "nomead" in sit or "empossad" in sit:
                    temPositivo = True
                    break

        resultados[nome_original] = temPositivo

    return resultados



