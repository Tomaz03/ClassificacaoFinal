import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function TopNav({ onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Classificação de Concursos</h1>
          <button
            onClick={onLogout}
            className="flex items-center text-white hover:text-gray-200 transition duration-300 font-medium"
          >
            <LogOut className="mr-2 h-5 w-5" /> Sair
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/comparar-concursos')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
          >
            Comparar Listas de Concursos
          </button>
          <button
            onClick={() => navigate('/resultados')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
          >
            Resultados por Nome
          </button>
          
        </div>
      </div>
    </header>
  );
}
