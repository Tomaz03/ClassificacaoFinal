# backend/crud.py
from sqlalchemy.orm import Session, joinedload
from backend import models, schemas
from backend.email_service import email_service
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta, timezone
import secrets
from sqlalchemy import func
from fastapi import HTTPException, status
from collections import Counter, defaultdict
import unicodedata
import logging
logger = logging.getLogger(__name__)

# -------------------------
# GET USER HELPERS
# -------------------------
def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_confirmation_token(db: Session, token: str):
    return db.query(models.User).filter(models.User.confirmation_token == token).first()

# -------------------------
# CREATE USER (gera token)
# -------------------------
def create_user(db: Session, user_data: dict):
    username = user_data.get('username') or user_data.get('name') or None
    if not username:
        try:
            username = user_data['email'].split('@')[0]
        except Exception:
            username = f"user_{secrets.token_hex(6)}"

    hashed_password = user_data['password']

    user = models.User(
        email=user_data['email'],
        username=username,
        hashed_password=hashed_password,
        is_active=True,
        role=user_data.get('role', 'comum'),
        provider=user_data.get('provider', 'local'),
        email_confirmed=False,
    )

    confirmation_token = secrets.token_urlsafe(32)
    user.confirmation_token = confirmation_token
    user.confirmation_sent_at = datetime.now(timezone.utc)

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

        logger.info(
            f"[DEBUG] Usuário {user.email} criado com token {user.confirmation_token}"
        )
        logger.info(
            f"[DEBUG] Link de confirmação: http://localhost:5173/confirmar-email?token={confirmation_token}"
         )

        try:
            email_service.send_confirmation_email(
                to_email=user.email,
                user_name=user.username or "Usuário",
                confirmation_token=confirmation_token,
            )
        except Exception:
            logger.exception("Falha ao enviar e-mail de confirmação (não impede criação).")

        return user

    except Exception:
        logger.exception("Erro ao criar usuário no banco de dados.")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar usuário."
        )
# -------------------------
# CONFIRM USER
# -------------------------
def confirm_user_email(db: Session, token: str):
    logger.info(f"Tentando confirmar e-mail com token: {token}")
    user = get_user_by_confirmation_token(db, token)

    if not user:
        logger.warning("Token de confirmação inválido ou já utilizado — usuário não encontrado.")
        return None

    if user.email_confirmed:
        logger.info(f"E-mail do usuário {user.email} já estava confirmado.")
        return user

    try:
        user.email_confirmed = True
        user.confirmation_token = None
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"E-mail confirmado com sucesso para o usuário id={user.id}, email={user.email}")
        return user
        
    except Exception as e:
        logger.exception("Erro crítico ao tentar salvar a confirmação de e-mail no banco de dados.")
        db.rollback()
        return None

# -------------------------
# RESEND CONFIRMATION
# -------------------------
def resend_confirmation_email(db: Session, email: str) -> bool:
    user = get_user_by_email(db, email)
    if not user:
        logger.warning(f"Tentativa de reenvio para e-mail não encontrado: {email}")
        return False

    if user.email_confirmed:
        logger.info(f"Não reenviando e-mail para {user.email}, pois já está confirmado.")
        return False

    try:
        new_token = secrets.token_urlsafe(32)
        user.confirmation_token = new_token
        user.confirmation_sent_at = datetime.now(timezone.utc)
        db.add(user)
        db.commit()
        db.refresh(user)

        logger.info(f"Reenviando e-mail de confirmação para: {user.email} (token gerado)")
        return True
    except Exception:
        logger.exception("Erro ao gerar/re-enviar token de confirmação.")
        db.rollback()
        return False


def create_user_google(db: Session, user_data: dict):
    try:
        db_user = models.User(
            email=user_data["email"],
            username=user_data.get("name", user_data["email"].split('@')[0]),
            hashed_password="oauth_google",
            provider="google",
            email_confirmed=True,
            is_active=True,
            role='comum'
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Falha ao criar usuário do Google: {e}")
        raise e

def create_contest(db: Session, contest: schemas.ContestCreate):
    db_contest = models.Contest(**contest.dict())
    db.add(db_contest)
    db.commit()
    db.refresh(db_contest)
    return db_contest

def get_contests(db: Session):
    return db.query(models.Contest).all()

def create_contest_results(db: Session, data: schemas.ContestResultCreate):
    if len(data.names) != len(data.final_scores):
        raise HTTPException(status_code=400, detail="Quantidade de nomes e notas não coincidem.")

    max_position = db.query(models.ContestResult.position).filter(
        models.ContestResult.contest_id == data.contest_id,
        models.ContestResult.category == data.category
    ).order_by(models.ContestResult.position.desc()).first()

    start_position = (max_position[0] if max_position else 0) + 1

    results = []
    for idx, (name, score) in enumerate(zip(data.names, data.final_scores)):
        result = models.ContestResult(
            contest_id=data.contest_id,
            category=data.category,
            position=start_position + idx,
            name=name.strip(),
            final_score=score
        )
        db.add(result)
        results.append(result)

    db.commit()
    for r in results:
        db.refresh(r)

    return results

# ✅ SUBSTITUÍDA: Função otimizada para buscar resultados com extras
def get_contest_results(db: Session, contest_id: int, skip: int = 0, limit: int = 100, category: Optional[str] = None):
    query = db.query(models.ContestResult).options(
        joinedload(models.ContestResult.extra)  # 🔑 Carrega os extras junto (JOIN)
    ).filter(models.ContestResult.contest_id == contest_id)

    if category:
        query = query.filter(models.ContestResult.category == category)

    return (
        query
        .order_by(models.ContestResult.position)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_results_count(db: Session, contest_id: int, category: Optional[str] = None) -> int:
    query = db.query(models.ContestResult).filter(models.ContestResult.contest_id == contest_id)
    if category:
        cat = category.strip().lower()
        query = query.filter(func.lower(models.ContestResult.category) == cat)
    return query.count()

def get_extra_by_result_id(db: Session, contest_result_id: int):
    return db.query(models.ContestResultExtra).filter(
        models.ContestResultExtra.contest_result_id == contest_result_id
    ).first()

def create_or_update_extra(db: Session, extra_data: Dict):
    contest_result_id = extra_data.get("contest_result_id")
    if contest_result_id is None:
        raise ValueError("contest_result_id é obrigatório")

    exists = db.query(models.ContestResult).filter_by(id=contest_result_id).first()
    if not exists:
        raise HTTPException(status_code=400, detail=f"contest_result_id {contest_result_id} não existe")

    db_obj = db.query(models.ContestResultExtra).filter_by(contest_result_id=contest_result_id).first()

    if db_obj:
        for key, value in extra_data.items():
            if key != "contest_result_id" and value is not None:
                setattr(db_obj, key, value)
    else:
        db_obj = models.ContestResultExtra(**extra_data)
        db.add(db_obj)

    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_extras_by_contest(db: Session, contest_id: int):
    return (
        db.query(models.ContestResultExtra)
        .join(models.ContestResult, models.ContestResult.id == models.ContestResultExtra.contest_result_id)
        .filter(models.ContestResult.contest_id == contest_id)
        .all()
    )

def delete_results_by_category(db: Session, contest_id: int, category: str):
    num_deleted = db.query(models.ContestResult).filter(
        models.ContestResult.contest_id == contest_id,
        models.ContestResult.category == category
    ).delete(synchronize_session=False)
    
    db.commit()
    return num_deleted

def get_all_results_by_name(db: Session, name: str):
    """
    Busca participações de um candidato em concursos,
    já filtrando no banco (muito mais rápido) e usando a extensão unaccent.
    """
    # 1. Normaliza o nome de entrada para a busca
    name_normalizado = normalizar_nome(name)

    # 2. Executa a query no banco de dados
    #    - outerjoin: Garante que resultados sem 'extra' também apareçam.
    #    - func.unaccent: Remove acentos dos nomes no banco antes de comparar.
    #    - func.lower: Converte para minúsculas para uma busca case-insensitive.
    resultados = (
        db.query(models.ContestResult)
        .join(models.ContestResult.contest)
        .outerjoin(models.ContestResult.extra)
        .filter(
            func.lower(func.unaccent(models.ContestResult.name)) == name_normalizado
        )
        .order_by(models.ContestResult.contest_id, models.ContestResult.position)
        .all()
    )

    return resultados

def update_contest(db: Session, contest_id: int, contest_update: schemas.ContestCreate):
    db_contest = db.query(models.Contest).filter(models.Contest.id == contest_id).first()

    if db_contest:
        update_data = contest_update.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_contest, key, value)
            
        db.add(db_contest)
        db.commit()
        db.refresh(db_contest)
    
    return db_contest

def get_results_by_name_and_category(db: Session, name: str, category: str):
    name_normalizado = normalizar_nome(name)

    resultados = db.query(models.ContestResult).filter(
        models.ContestResult.category == category
    ).order_by(models.ContestResult.position).all()

    resultados_filtrados = [
        r for r in resultados if normalizar_nome(r.name) == name_normalizado
    ]

    return resultados_filtrados

def compare_contests(db: Session, contest_id_1: int, contest_id_2: int):
    from backend.models import ContestResult
    from sqlalchemy.orm import joinedload
    import unicodedata

    results_1 = db.query(ContestResult).options(joinedload(ContestResult.extra)).filter(
        ContestResult.contest_id == contest_id_1
    ).all()

    results_2 = db.query(ContestResult).options(joinedload(ContestResult.extra)).filter(
        ContestResult.contest_id == contest_id_2
    ).all()

    def normalizar(nome: str) -> str:
        if not nome:
            return ""
        return (
            unicodedata.normalize("NFD", nome)
            .encode("ascii", "ignore")
            .decode("utf-8")
            .lower()
            .strip()
        )

    map_1 = defaultdict(list)
    map_2 = defaultdict(list)
    name_counters = defaultdict(Counter)

    for r in results_1:
        nome_norm = normalizar(r.name)
        entry = {
            "name": r.name,
            "category": r.category,
            "position": r.position,
            "contest_result_id": getattr(r, "id", None),
            "situacao": (r.extra.situacao if (r.extra and r.extra.situacao) else "Aguardando Convocação")
        }
        map_1[nome_norm].append(entry)
        name_counters[nome_norm][r.name] += 1

    for r in results_2:
        nome_norm = normalizar(r.name)
        entry = {
            "name": r.name,
            "category": r.category,
            "position": r.position,
            "contest_result_id": getattr(r, "id", None),
            "situacao": (r.extra.situacao if (r.extra and r.extra.situacao) else "Aguardando Convocação")
        }
        map_2[nome_norm].append(entry)
        name_counters[nome_norm][r.name] += 1

    common_names = set(map_1.keys()) & set(map_2.keys())

    response = []
    for nome_norm in sorted(common_names):
        counter = name_counters[nome_norm]
        if counter:
            canonical_name = counter.most_common(1)[0][0]
        else:
            canonical_name = (map_1[nome_norm][0]["name"] if map_1[nome_norm] else
                              (map_2[nome_norm][0]["name"] if map_2[nome_norm] else ""))

        response.append({
            "name": canonical_name,
            "norm": nome_norm,
            "contest_1": map_1[nome_norm],
            "contest_2": map_2[nome_norm],
        })

    try:
        logger.info("compare_contests: contest1=%s contest2=%s matches=%d sample=%s",
                    contest_id_1, contest_id_2, len(response), response[:10])
    except Exception:
        pass

    return response

def normalizar_nome(nome: str) -> str:
    if not nome:
        return ""
    nome = nome.lower()
    nome = unicodedata.normalize('NFD', nome)
    nome = "".join(c for c in nome if unicodedata.category(c) != 'Mn')
    return nome.strip()

def get_results_by_names_batch(db: Session, names: List[str]) -> Dict[str, bool]:
    nomes_normalizados = {name: normalizar_nome(name) for name in names}
    resultados = {name: False for name in names}

    todos_resultados = db.query(models.ContestResult).all()

    for r in todos_resultados:
        nome_norm = normalizar_nome(r.name)
        for original, normalizado in nomes_normalizados.items():
            if nome_norm == normalizado:
                if r.extra and r.extra.situacao:
                    sit = r.extra.situacao.lower()
                    if "nomead" in sit or "empossad" in sit:
                        resultados[original] = True

    return resultados
