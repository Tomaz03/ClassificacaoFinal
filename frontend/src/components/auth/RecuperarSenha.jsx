import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Instruções enviadas para seu e-mail.');
        setShowMessage(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage(data.error || 'Erro ao enviar e-mail.');
        setShowMessage(true);
      }
    } catch (err) {
      setMessage('Erro de conexão com o servidor.');
      setShowMessage(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Recuperar Senha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Enviar Instruções
          </button>
        </form>

        {showMessage && (
          <p className="mt-4 text-green-600 text-center">{message}</p>
        )}
      </div>
    </div>
  );
}