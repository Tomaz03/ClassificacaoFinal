# --- IMPORTS PADRÃO E DE BIBLIOTECAS ---
import os
import secrets
from typing import List, Dict, Any

# FastAPI e componentes relacionados
from fastapi import FastAPI, Depends, HTTPException, status, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from starlette.middleware.sessions import SessionMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response

# SQLAlchemy e Pydantic
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Authlib e DotEnv
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv

# Carrega as variáveis de ambiente PRIMEIRO
load_dotenv()

# --- CONFIGURAÇÃO INICIAL DA APLICAÇÃO ---

# URL do frontend (usada no CORS e no fluxo do Google OAuth)
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://classificacaofinal-frontend.onrender.com")

# Crie a instância do app ANTES de importar suas próprias rotas/módulos
app = FastAPI(title="Classificação de Concursos — Auth API")

# Defina a chave secreta e adicione o SessionMiddleware
SECRET_KEY = os.getenv("SECRET_KEY") or secrets.token_hex(32)
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# Defina as URLs e adicione o CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",  # Para desenvolvimento local
        "http://localhost:8000",  # Para desenvolvimento local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IMPORTS DO SEU PRÓPRIO PROJETO (AGORA QUE O APP ESTÁ CONFIGURADO) ---
# Mova todos os imports "from backend..." para depois da configuração do app

from backend.database import Base, engine, get_db
from backend.models import User
from backend import schemas, crud, auth
from backend.routers import results
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)
from backend.crud import (
    create_user,
    create_user_google,
    get_user_by_email,
    get_user_by_id,
    confirm_user_email, resend_confirmation_email
)
from backend.schemas import (
    RegisterIn, LoginIn, UserOut,
    TokenIn,
    ContestResultExtra, ContestResultExtraCreate, ContestResultExtraUpdate
)

# --- LÓGICA DA APLICAÇÃO ---

# Criar as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

# Incluir o roteador (depois de tudo configurado)
app.include_router(results.router, prefix="/api")

# Configuração do OAuth
oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)

# Esquema de resposta para o token de acesso
class LoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Autenticação via token
oauth2_scheme = HTTPBearer()


def get_current_user(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme)
):
    payload = decode_token(token.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação inválido ou expirado",
        )

    # ✅ LÓGICA DE EXTRAÇÃO APRIMORADA:
    user_id = payload.get("sub")

    # Se o 'sub' for um dicionário (cenário do erro anterior), extraia o ID de dentro dele.
    if isinstance(user_id, dict):
        user_id = user_id.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Formato de token inválido: 'sub' não encontrado.",
        )

    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Formato de token inválido: 'sub' não é um ID válido.",
        )

    user = get_user_by_id(db, user_id_int)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário do token não encontrado.",
        )
    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado: apenas administradores")
    return current_user

@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: RegisterIn, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado"
        )
    
    # Criar o usuário com a senha hasheada
    user_data_dict = user_data.model_dump()
    user_data_dict['password'] = hash_password(user_data_dict['password'])
    
    new_user = create_user(db, user_data_dict)
    
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar usuário"
        )
    
    return {"message": "Cadastro realizado com sucesso. Verifique seu e-mail para confirmar a conta."}

@app.post("/auth/login", status_code=status.HTTP_200_OK, response_model=LoginOut)
async def login(user_data: LoginIn, db: Session = Depends(get_db)):
    user = get_user_by_email(db, user_data.email)
    
    if not user or not user.hashed_password or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    
    if not user.email_confirmed:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail não confirmado. Verifique sua caixa de entrada.",
        )
    
    # ✅ CORREÇÃO AQUI: Crie um dicionário simples para o payload do token.
    # Não aninhe um dicionário com a chave "sub" dentro do subject.
    token_payload = {
        "sub": str(user.id),  # O 'sub' (subject) deve ser o ID do usuário como string
        "email": user.email,
        "provider": user.provider,
        # Você pode adicionar outros dados que julgar úteis aqui
    }
    
    access_token = create_access_token(subject=token_payload)
    
    return {
        "access_token": access_token,
        "user": user
    }

@app.get("/auth/google")
async def google_login(request: Request, frontend_origin: str = None):
    redirect_uri = str(request.url_for('google_auth'))
    
    # Store frontend_origin in session or state
    request.session['frontend_origin'] = frontend_origin or FRONTEND_URL
    
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback", name="google_auth")
async def google_auth(request: Request, db: Session = Depends(get_db)):
    try:
        print("✅ Iniciando callback do Google OAuth")
        
        # Obter token do Google
        token = await oauth.google.authorize_access_token(request)
        print(f"✅ Token recebido: {token}")
        
        if not token:
            print("❌ Token não recebido")
            raise HTTPException(status_code=400, detail="Token de acesso inválido.")

        # Obter informações do usuário no Google
        resp = await oauth.google.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            token=token
        )
        user_info = resp.json()
        print(f"✅ User info: {user_info}")

        email = user_info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="E-mail não encontrado na conta Google.")

        # Buscar ou criar usuário no banco
        user = get_user_by_email(db, email)
        if not user:
            user = create_user_google(
                db,
                user_data={
                    "email": email,
                    "name": user_info.get("name"),
                    "picture": user_info.get("picture"),
                },
            )

        # Criar token JWT
        token_payload = {
            "sub": str(user.id),
            "email": user.email,
            "provider": user.provider,
        }
        access_token = create_access_token(subject=token_payload)

        # Origem do frontend (preferência: session → fallback: FRONTEND_URL)
        frontend_origin = request.session.get("frontend_origin", FRONTEND_URL)

        # HTML que envia o token para o frontend via postMessage
        response_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <script>
                window.opener.postMessage({{
                    status: 'success',
                    access_token: '{access_token}',
                    user_data: {{
                        id: '{user.id}',
                        email: '{user.email}',
                        name: '{user.username}',
                        provider: '{user.provider}'
                    }}
                }}, '{frontend_origin}');
                window.close();
            </script>
        </head>
        <body>
            Redirecionando...
        </body>
        </html>
        """
        return Response(content=response_html, media_type="text/html")

    except Exception as e:
        print(f"❌ Erro no login com Google: {e}")
        response_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <script>
                window.opener.postMessage({{
                    status: 'error',
                    message: 'Erro no login com Google: {str(e)}'
                }}, '{FRONTEND_URL}');
                window.close();
            </script>
        </head>
        <body>
            Erro no login: {str(e)}
        </body>
        </html>
        """
        return Response(content=response_html, media_type="text/html", status_code=400)

@app.post("/auth/confirmar-email", response_model=LoginOut)
def confirmar_email_endpoint(token_data: TokenIn, db: Session = Depends(get_db)):
    print(f"Backend recebeu token: {token_data.token}")
    user = crud.confirm_user_email(db, token=token_data.token)

    if not user:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")

    # Gera um access token com claim 'sub'
    access_token = create_access_token(subject={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "user": user
    }


@app.post("/auth/resend-confirmation")
def resend_confirmation_endpoint(request: schemas.ResendEmailIn, db: Session = Depends(get_db)):
    """
    Reenvia o e-mail de confirmação para um usuário.
    """
    success = crud.resend_confirmation_email(db, request.email)
    
    if not success:
        # Usamos 202 Accepted para não dar informações se o e-mail existe
        # ou se já está confirmado. Melhora a segurança contra enumeração de usuários.
        return {
            "message": "Se o e-mail estiver cadastrado e não confirmado, um novo link será enviado."
        }
    
    return {
        "message": "E-mail de confirmação reenviado com sucesso!"
    }

@app.get("/auth/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Obter dados do usuário atual"""
    return current_user

@app.get("/")
async def root():
    """Endpoint raiz"""
    return {"message": "API de Classificação de Concursos"}

# Endpoint para verificar status do e-mail
@app.get("/auth/email-status/{email}")
async def check_email_status(email: str, db: Session = Depends(get_db)):
    """Verificar status de confirmação do e-mail"""
    user = get_user_by_email(db, email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="E-mail não encontrado"
        )
    
    return {
        "email_confirmed": user.email_confirmed
    }

# --- Endpoints Concurso ---
@app.post("/api/contests/", response_model=schemas.Contest)
def create_contest(contest: schemas.ContestCreate, db: Session = Depends(get_db)):
    return crud.create_contest(db, contest)

@app.get("/api/contests/", response_model=List[schemas.Contest])
def list_contests(db: Session = Depends(get_db)):
    return crud.get_contests(db)

# --- Endpoints Resultados ---
@app.post("/api/contest-results/", response_model=List[schemas.ContestResult])
def create_results(data: schemas.ContestResultCreate, db: Session = Depends(get_db)):
    return crud.create_contest_results(db, data)

@app.get("/api/contest-results/{contest_id}", response_model=List[schemas.ContestResult])
def list_results(contest_id: int, db: Session = Depends(get_db)):
    return crud.get_results_by_contest(db, contest_id)

@app.get("/api/contest-results-extra/{contest_result_id}", response_model=ContestResultExtra)
def get_contest_result_extra(contest_result_id: int, db: Session = Depends(get_db)):
    extra = crud.get_extra_by_result_id(db, contest_result_id)
    if not extra:
        raise HTTPException(status_code=404, detail="Extras não encontrados para este resultado")
    return extra

@app.post("/api/contest-results-extra/", response_model=ContestResultExtra)
def create_or_update_contest_result_extra(
    extra: ContestResultExtraCreate, 
    db: Session = Depends(get_db)
    # Removi a dependência de usuário aqui, pois um usuário comum deve poder salvar seus dados.
    # Se precisar de autenticação, use auth.get_current_user em vez de get_current_admin_user
):
    # ✅ MELHORIA: Passamos os dados de forma mais clara para a função CRUD.
    update_data = extra.model_dump(exclude_unset=True)
    return crud.create_or_update_extra(db, extra.contest_result_id, update_data)

@app.get("/api/contest-results-extra/by-contest/{contest_id}", response_model=List[ContestResultExtra])
def get_extras_by_contest(contest_id: int, db: Session = Depends(get_db)):
    return crud.get_extras_by_contest(db, contest_id)

# Adicione este novo endpoint DELETE
@app.delete("/api/contest-results/{contest_id}/{category}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contest_results_by_category(
    contest_id: int, 
    category: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)  # ✅ usar User direto
):
    crud.delete_results_by_category(db, contest_id=contest_id, category=category)
    return


@app.get("/api/results-by-name/", response_model=List[schemas.ContestResult])
def get_results_by_name(
    name: str = Query(..., min_length=3), 
    db: Session = Depends(get_db)
):
    """
    Busca todos os resultados de um candidato pelo nome.
    """
    return crud.get_all_results_by_name(db, name=name)

@app.put("/api/contests/{contest_id}", response_model=schemas.Contest)
def update_contest_endpoint(
    contest_id: int,
    contest: schemas.ContestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)  # ✅ usar User direto
):
    updated_contest = crud.update_contest(db, contest_id=contest_id, contest_update=contest)
    if not updated_contest:
        raise HTTPException(status_code=404, detail="Concurso não encontrado")
    return updated_contest

@app.get("/api/results-by-criteria/", response_model=List[schemas.ContestResult])
def get_results_by_criteria(
    name: str = Query(...),
    category: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Busca resultados com base no nome exato do concurso e na categoria.
    """
    # Esta busca é mais simples e não precisa dos joins complexos
    # pois a tabela de resultados já tem a categoria.
    # Vamos adaptar a busca para ser mais flexível no frontend.
    # Por enquanto, vamos manter a busca pelo ID que é mais precisa.
    # A lógica de troca de categoria será feita no frontend.
    pass # Manteremos a lógica atual no frontend por simplicidade, mas esta seria a evolução.

@app.get("/api/contests/compare/{contest_id_1}/{contest_id_2}")
def compare_contests_api(contest_id_1: int, contest_id_2: int, db: Session = Depends(get_db)):
    results = crud.compare_contests(db, contest_id_1, contest_id_2)
    return {"matches": results, "count": len(results)}

@app.post("/api/results-by-names-batch")
def results_by_names_batch(names: List[str], db: Session = Depends(get_db)):
    """
    Recebe uma lista de nomes e retorna, para cada um, 
    se já foi nomeado/empossado em qualquer concurso.
    """
    return crud.get_results_by_names_batch(db, names)


