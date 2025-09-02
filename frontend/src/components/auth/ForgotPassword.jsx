import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword({ onSendRecoveryEmail }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        onSendRecoveryEmail();
        setTimeout(() => navigate('/'), 2000);
      } else {
        setMessage(data.error || 'Erro ao enviar email de recuperação');
      }
    } catch (err) {
      console.error('Erro ao recuperar senha:', err);
      setMessage('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recuperar Senha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Enviando...' : 'Enviar Link'}
          </button>
          {message && <p className="mt-2 text-green-500">{message}</p>}
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Lembrou a senha?{' '}
          <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-800">
            Voltar para login
          </button>
        </p>
      </div>
    </div>
  );
}