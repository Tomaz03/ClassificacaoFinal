import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Importa o ícone Loader2

// Uma função auxiliar para decodificar tokens JWT
const decodeJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Erro ao decodificar token:", error);
        return null;
    }
};

// Este componente protegerá rotas verificando um token válido e o papel do utilizador
export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Adicionado estado de carregamento
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const verifyAuth = async () => {
            setIsLoading(true); // Iniciar carregamento
            const token = localStorage.getItem('token');

            if (!token) {
                console.log("Token não encontrado. Redirecionando para login.");
                setIsAuthenticated(false);
                setUserRole(null);
                navigate('/login'); // Redirecionar para login se não houver token
                setIsLoading(false); // Terminar carregamento
                return;
            }

            const decodedToken = decodeJwt(token);

            if (!decodedToken) {
                console.log("Token inválido ou expirado. Redirecionando para login.");
                localStorage.removeItem('token'); // Limpar token inválido
                setIsAuthenticated(false);
                setUserRole(null);
                navigate('/login'); // Redirecionar para login se o token for inválido
                setIsLoading(false); // Terminar carregamento
                return;
            }

            // Opcional: Pode querer enviar o token para o seu backend
            // para validar a sua autenticidade e expiração de forma mais robusta.
            // Por enquanto, estamos apenas a verificar a decodificação do lado do cliente.
            try {
                // Exemplo de uma chamada de validação do backend (descomentar e implementar se necessário)
                // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
                //     headers: {
                //         'Authorization': `Bearer ${token}`
                //     }
                // });
                // if (!response.ok) {
                //     throw new Error('Token validation failed on backend');
                // }
                // const userData = await response.json(); // Obter dados do utilizador do backend se necessário
                // console.log("Token validado pelo backend. User Data:", userData);

                const role = decodedToken.role;
                console.log("✅ Token carregado. Role:", role);

                if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
                    console.warn(`Acesso negado. O papel '${role}' não é permitido para esta rota.`);
                    setIsAuthenticated(false);
                    setUserRole(role);
                    // Redirecionar para uma página diferente (ex: página não autorizada ou dashboard)
                    navigate('/dashboard'); // Ou '/unauthorized'
                    setIsLoading(false); // Terminar carregamento
                    return;
                }

                setIsAuthenticated(true);
                setUserRole(role);
            } catch (error) {
                console.error("Erro na validação do token ou acesso:", error);
                localStorage.removeItem('token'); // Limpar token se a validação do backend falhar
                setIsAuthenticated(false);
                setUserRole(null);
                navigate('/login');
            } finally {
                setIsLoading(false); // Garantir que o carregamento é sempre definido como falso
            }
        };

        verifyAuth();
    }, [navigate, allowedRoles]); // Adicionar navigate e allowedRoles ao array de dependências

    if (isLoading) {
        // Pode renderizar um spinner de carregamento ou uma mensagem simples aqui
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
                <p className="ml-3 text-gray-700">Carregando...</p>
            </div>
        );
    }

    // Se não estiver autenticado após as verificações, os filhos não serão renderizados (a navegação já foi tratada)
    // Se estiver autenticado, renderizar os filhos
    return isAuthenticated ? children : null;
}
