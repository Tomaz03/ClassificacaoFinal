import os
import secrets
import string
from datetime import datetime, timedelta
from mailjet_rest import Client
from dotenv import load_dotenv # Adicionado

# Adicionado: Carrega as variáveis do arquivo .env
load_dotenv()

class EmailService:
    def __init__(self):
        # Carrega as variáveis de ambiente
        self.api_key = os.getenv("MAILJET_API_KEY")
        self.secret_key = os.getenv("MAILJET_SECRET_KEY")
        self.from_email = os.getenv("FROM_EMAIL")
        self.from_name = os.getenv("FROM_NAME", "Classificação de Concursos")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

        # Verifica se as variáveis foram carregadas corretamente
        print(f"MAILJET_API_KEY carregada: {'Sim' if self.api_key else 'Não'}")
        print(f"MAILJET_SECRET_KEY carregada: {'Sim' if self.secret_key else 'Não'}")
        print(f"FROM_EMAIL carregado: {self.from_email}")

        # Inicializa o cliente Mailjet apenas se as chaves estiverem presentes
        if self.api_key and self.secret_key:
            self.mailjet = Client(auth=(self.api_key, self.secret_key), version='v3.1')
        else:
            self.mailjet = None
            print("AVISO: Chaves Mailjet ausentes. O serviço de e-mail não será inicializado.")
    
    def generate_confirmation_token(self) -> str:
        """Gera um token seguro para confirmação de e-mail"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(32))

    def send_confirmation_email(self, to_email: str, user_name: str, confirmation_token: str) -> bool:
        """Envia e-mail de confirmação via Mailjet API"""
        if not self.mailjet:
            print("Erro: Serviço de e-mail não inicializado. Verifique as chaves de API.")
            return False

        try:
            confirmation_url = f"{self.frontend_url}/confirmar-email?token={confirmation_token}"

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Confirme seu e-mail</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        background-color: #fff;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        text-align: center;
                        border-bottom: 2px solid #ddd;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }}
                    .header h1 {{
                        color: #3f51b5;
                        margin: 0;
                    }}
                    .content {{
                        text-align: center;
                    }}
                    .content h2 {{
                        color: #555;
                    }}
                    .content p {{
                        font-size: 16px;
                    }}
                    .button {{
                        display: inline-block;
                        padding: 10px 20px;
                        margin: 20px 0;
                        background-color: #4CAF50;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 20px;
                        padding-top: 10px;
                        border-top: 2px solid #ddd;
                    }}
                    .footer p {{
                        color: #666;
                        font-size: 12px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Classificação de Concursos</h1>
                    </div>
                    <div class="content">
                        <h2>Olá, {user_name}!</h2>
                        <p>Obrigado por se cadastrar em nossa plataforma. Por favor, clique no botão abaixo para confirmar seu e-mail e ativar sua conta:</p>
                        <a href="{confirmation_url}" class="button">Confirmar E-mail</a>
                        <p>Se o botão acima não funcionar, copie e cole o link abaixo em seu navegador:</p>
                        <p><a href="{confirmation_url}">{confirmation_url}</a></p>
                    </div>
                    <div class="footer">
                        <p>Se você não se cadastrou em nossa plataforma, ignore este e-mail.</p>
                    </div>
                </div>
            </body>
            </html>
            """

            data = {
                'Messages': [
                    {
                        "From": {
                            "Email": self.from_email,
                            "Name": self.from_name
                        },
                        "To": [
                            {
                                "Email": to_email,
                                "Name": user_name
                            }
                        ],
                        "Subject": "Confirme seu e-mail - Classificação de Concursos",
                        "HTMLPart": html_content,
                        "CustomID": "EmailConfirmation"
                    }
                ]
            }

            print(f"Tentando enviar e-mail para: {to_email}")
            result = self.mailjet.send.create(data=data)
            print(f"Status da resposta da API Mailjet: {result.status_code}")
            return result.status_code == 200

        except Exception as e:
            print(f"Erro ao enviar e-mail: {str(e)}")
            return False

    def is_token_expired(self, sent_at: datetime) -> bool:
        """Verifica se o token de confirmação expirou (24 horas)"""
        if not sent_at:
            return True
        return datetime.utcnow() > sent_at + timedelta(hours=24)

# Instância global
email_service = EmailService()













