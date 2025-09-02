import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import { useAuth } from '../hooks/useAuth'; // Importe o hook

export default function MainLayout() {

  const { logout } = useAuth(); // ✅ Pegue a função logout do contexto

  return (
    <div>
      {/* A prop agora chama a função 'logout' diretamente do hook */}
      <TopNav onLogout={logout} /> 
      <main>
        <Outlet /> 
      </main>
    </div>
  );
}

