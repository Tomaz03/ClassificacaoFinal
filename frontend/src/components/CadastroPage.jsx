import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react'; // Importação adicionada para o ícone de carregamento

export default function CadastroPage() {
  const { user, register, handleGoogleLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

// ✅ PASSO 2: CRIAR UMA FUNÇÃO WRAPPER PARA LIDAR COM O CLIQUE
  const onGoogleLoginClick = async () => {
    try {
      await handleGoogleLogin();
      // O redirecionamento já é feito dentro do handleGoogleLogin
    } catch (error) {
      // Mostra o erro para o usuário se o login com Google falhar
      setError(error.message);
      console.error("Falha no login com Google:", error);
    }
  };

  // Se o usuário já estiver logado, redireciona para MeusResultados
  if (user) {
    return <Navigate to="/meus-resultados" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-lg rounded-xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Crie sua conta</CardTitle>
          <CardDescription>
            Cadastre-se para começar a classificar resultados de concursos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="exemplo@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-400"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-400"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200" disabled={loading}>
              {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Carregando...</span>
                  </div>
                ) : (
                'Cadastrar'
              )}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onGoogleLoginClick}
              className="w-full h-12 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 flex items-center justify-center font-medium rounded-lg shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="underline font-bold">
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

