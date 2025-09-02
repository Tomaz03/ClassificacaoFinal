// App.jsx - VERSÃO CORRIGIDA E SIMPLIFICADA

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage.jsx';
import CadastroPage from './components/CadastroPage.jsx';
import MeusResultados from './components/MeusResultados.jsx';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import MainLayout from './components/MainLayout';
import CompararConcursos from './components/CompararConcursos';
import ResultadosPorNome from "./components/ResultadosPorNome";
import ConfirmarEmailPage from './components/ConfirmarEmailPage.jsx';
import Home from './components/Home.jsx'; // O componente da sua página inicial pública

// Componente para rotas protegidas (sem alterações)
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* --- ROTAS PÚBLICAS --- */}
          {/* A rota raiz "/" é pública e mostra a página Home. */}
          <Route path="/" element={<Home />} /> 
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/confirmar-email" element={<ConfirmarEmailPage />} />

          {/* --- ROTAS PROTEGIDAS --- */}
          {/* Agrupamos as rotas que exigem login aqui. */}
          <Route 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Todas as rotas aqui dentro são protegidas */}
            <Route path="/meus-resultados" element={<MeusResultados />} />
            <Route path="/comparar-concursos" element={<CompararConcursos />} />
            <Route path="/resultados" element={<ResultadosPorNome />} />
          </Route>

          {/* Rota para qualquer outro caminho não encontrado */}
          <Route path="*" element={<div>Página não encontrada</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;









