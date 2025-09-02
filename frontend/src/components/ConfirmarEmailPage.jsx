// ConfirmarEmailPage.jsx
import React, { useEffect, useState, useRef } from "react"; // 1. Importe o useRef
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function ConfirmarEmailPage( ) {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const { loginWithToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 2. Crie uma referência para controlar a execução
  const confirmationSent = useRef(false);

  useEffect(() => {
    // 3. Verifique se a confirmação já foi enviada. Se sim, não faça nada.
    if (confirmationSent.current) {
      return;
    }
    // 4. Marque como enviada IMEDIATAMENTE para impedir execuções futuras
    confirmationSent.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    console.log("Frontend: Token extraído da URL:", token);

    const confirmarEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token de confirmação não encontrado na URL.");
        return;
      }

      try {
        console.log("Enviando para o backend:", JSON.stringify({ token }));
        const res = await fetch(`${BACKEND_URL}/auth/confirmar-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const text = await res.text();
        let data = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (e) {
          data = { detail: text || "Resposta inválida do servidor" };
        }

        if (res.ok) {
          const accessToken = data?.access_token ?? null;
          if (accessToken) {
            await loginWithToken(accessToken);
          }
          setStatus("success");
          setMessage("Seu e-mail foi confirmado com sucesso! Você será redirecionado em instantes.");
          setTimeout(() => navigate("/meus-resultados", { replace: true }), 2000);
        } else {
          setStatus("error");
          setMessage(data?.detail || "Ocorreu um erro ao confirmar seu e-mail.");
        }
      } catch (error) {
        console.error("Erro na confirmação de e-mail:", error);
        setStatus("error");
        setMessage("Não foi possível conectar ao servidor. Verifique sua conexão.");
      }
    };

    confirmarEmail();
    // A lista de dependências permanece a mesma
  }, [location.search, navigate, loginWithToken]);

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm text-gray-500">Confirmando seu e-mail...</p>
        </div>
      );
    }

    const isSuccess = status === "success";
    return (
      <div className="flex flex-col items-center p-6 text-center space-y-4">
        <h2 className={`text-2xl font-bold ${isSuccess ? "text-green-600" : "text-red-600"}`}>
          {isSuccess ? "Sucesso!" : "Ops! Erro!"}
        </h2>
        <p className={`${isSuccess ? "text-gray-700" : "text-red-500"}`}>{message}</p>

        {!isSuccess && (
          <div className="mt-4">
            <Button onClick={() => (window.location.href = "/cadastro")}>Tentar novamente</Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <CardTitle>Confirmação de E-mail</CardTitle>
          <CardDescription>Estamos processando sua solicitação...</CardDescription>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}




