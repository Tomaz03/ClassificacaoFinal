import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔑 URL base do backend (Render ou localhost)
  // ✅ CORREÇÃO: Corrigir nome da variável de ambiente
  const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  // ✅ CORREÇÃO: Função para obter o token de autorização (exportada)
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  // ✅ CORREÇÃO: Verificar se o usuário é admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Verificar se há token salvo no localStorage ao inicializar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  // Função para logar com um token (usado na confirmação de e-mail e Google Login)
  const loginWithToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados do usuário após a confirmação.');
      }
      
      const userData = await response.json();
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login com token:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Função de login com e-mail e senha
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.detail || 'Erro ao fazer login.' };
      }
      
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });
      
      if (!userResponse.ok) {
        throw new Error('Falha ao buscar dados do usuário.');
      }
      
      const userData = await userResponse.json();
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Ocorreu um erro inesperado.' };
    }
  };

  // Função de registro de novo usuário
  const register = async (name, email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      return { success: false, error: 'As senhas não coincidem.' };
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.detail || 'Erro no cadastro.' };
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: 'Ocorreu um erro inesperado.' };
    }
  };
  
  // Função de logout
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
    navigate('/login', { replace: true });
  };

  // ✅ Função de login com Google
  const handleGoogleLogin = () => {
    return new Promise((resolve, reject) => {
      const backendUrl = API_URL;
      const frontendOrigin = window.location.origin;
      const googleAuthUrl = `${backendUrl}/auth/google?frontend_origin=${encodeURIComponent(frontendOrigin)}`;

      const popup = window.open(googleAuthUrl, '_blank', 'width=500,height=600');

      const messageListener = async (event) => {
        console.log("Mensagem recebida:", event.origin, event.data);

        const allowedOrigins = [
          window.location.origin,
          backendUrl,
        ];

        if (!allowedOrigins.includes(event.origin)) {
          console.warn("Origem não permitida:", event.origin);
          return;
        }

        if (event.data?.status === 'success' && event.data?.access_token) {
          console.log("Login com Google bem-sucedido, token recebido");
          const { access_token } = event.data;
          const loginResult = await loginWithToken(access_token);

          cleanup();
          if (loginResult.success) {
            navigate('/meus-resultados');
            resolve(loginResult);
          } else {
            console.log("Falha no loginWithToken:", loginResult.error);
            reject(new Error('Falha ao processar o token do Google.'));
          }
        } else if (event.data?.status === 'error') {
          console.log("Erro no login com Google:", event.data.message);
          cleanup();
          reject(new Error(event.data.message || 'Erro no login com Google.'));
        }
      };

      const timer = setInterval(() => {
        if (popup && popup.closed) {
          cleanup();
          reject(new Error('Login com Google cancelado.'));
        }
      }, 500);

      const cleanup = () => {
        clearInterval(timer);
        window.removeEventListener('message', messageListener);
        if (popup && !popup.closed) {
          popup.close();
        }
      };

      window.addEventListener('message', messageListener);
    });
  };

  // ✅ CORREÇÃO: Função para fazer requisições autenticadas (melhorada)
  const authenticatedFetch = async (url, options = {}) => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }
    
    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      console.log(`🔍 Fazendo requisição autenticada para: ${url}`);
      console.log(`🔑 Token: ${token.substring(0, 20)}...`);
      
      const response = await fetch(url, authOptions);
      
      console.log(`📡 Resposta recebida: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        console.error('❌ Token expirado ou inválido');
        logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      if (response.status === 403) {
        console.error('❌ Acesso negado - usuário não é admin');
        throw new Error('Acesso negado. Apenas administradores podem acessar esta funcionalidade.');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Erro na requisição autenticada:', error);
      throw error;
    }
  };

  // ✅ CORREÇÃO: Valor fornecido pelo contexto (incluindo novas funções)
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    handleGoogleLogin,
    loginWithToken,
    authenticatedFetch,
    getAuthToken,  // ✅ Exportar função
    isAdmin,       // ✅ Verificar se é admin
    token: getAuthToken() // ✅ Disponibilizar token diretamente
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

