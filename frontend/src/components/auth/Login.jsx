import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react'; // Importa ícones de olho e loader
import logo from '../../assets/logo.png'; // Verifique se este caminho está correto!

export default function Login({ onLoginSuccess }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Estado para alternar visibilidade da senha

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Limpa mensagens anteriores
        setMessageType('');
        setIsLoading(true);

        try {
            // Adaptação para o endpoint /api/token do FastAPI que espera form-urlencoded
            const formData = new URLSearchParams();
            formData.append('username', email); // FastAPI espera 'username' para o campo de usuário
            formData.append('password', password);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token); // O token é 'access_token' do FastAPI

                // Decodifica o payload do token para verificar a role
                const payload = JSON.parse(atob(data.access_token.split('.')[1]));
                const isAdmin = payload.role === 'admin';

                if (onLoginSuccess) onLoginSuccess(data.access_token);
                setMessage('Login bem-sucedido!');
                setMessageType('success');

                setTimeout(() => {
                    navigate(isAdmin ? '/admin' : '/dashboard');
                }, 1500); // Aumentado um pouco para a mensagem ser lida
            } else {
                // O FastAPI retorna 'detail' para erros de autenticação
                setMessage(data.detail || 'Erro no login. Verifique e-mail e senha.');
                setMessageType('error');
            }
        } catch (err) {
            console.error('Erro de conexão:', err);
            setMessage('Erro de conexão com o servidor. Tente novamente.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
            // Mensagem de sucesso/erro pode ser persistente ou desaparecer mais lentamente
            // A mensagem de sucesso já redireciona, então só faz sentido para erros
            if (messageType !== 'success') {
                setTimeout(() => setMessage(''), 5000);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col font-inter">
            {/* Mensagens de Status Flutuantes */}
            {message && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in-down
                    ${messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {message}
                </div>
            )}

            {/* Header aprimorado */}
            <header className="bg-white shadow-lg px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    {/* Verifique o caminho do logo. Se não tiver, remova esta linha. */}
                    <img src={logo} alt="Questões da Aprovação Logo" className="h-16 sm:h-20 w-auto object-contain mt-1" />
                </div>
                <nav>
                    <button onClick={() => navigate('/register')} className="text-blue-600 hover:text-blue-800 font-semibold px-4 py-2 rounded-lg transition duration-300">
                        Criar Conta
                    </button>
                </nav>
            </header>

            <main className="flex-grow flex items-center justify-center px-4 py-12 md:py-16">
                <div className="w-full max-w-5xl bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transform transition-all duration-500 ease-in-out scale-95 md:scale-100 hover:scale-[1.01]">
                    {/* Seção de Marketing/Benefícios (Lado Esquerdo) */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex flex-col justify-center space-y-6">
                        <h2 className="text-4xl font-extrabold leading-tight tracking-tight animate-fade-in-up">
                            Sua <span className="text-yellow-300">Aprovação</span> Começa Aqui!
                        </h2>
                        <p className="text-lg leading-relaxed opacity-90 animate-fade-in-up delay-100">
                            Acesse milhares de questões, crie cadernos personalizados e acompanhe seu progresso. Tudo que você precisa para conquistar a vaga dos seus sonhos.
                        </p>
                        <ul className="space-y-3 text-sm opacity-95 animate-fade-in-up delay-200">
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-300 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Questões atualizadas diariamente
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-300 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Gabaritos e comentários de professores
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-300 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Acompanhamento detalhado de performance
                            </li>
                        </ul>
                        <div className="space-y-4 pt-6">
                            <button onClick={() => navigate('/plans')} className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transform transition duration-300">
                                EXPLORE NOSSOS PLANOS
                            </button>
                        </div>
                    </div>

                    {/* Formulário de Login (Lado Direito) */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 space-y-7 animate-fade-in-right">
                        <h2 className="text-3xl font-bold text-gray-900 text-center">Boas-vindas de volta!</h2>
                        <p className="text-center text-gray-600 text-sm">Entre com sua conta para continuar seus estudos.</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 shadow-sm text-gray-800"
                                    placeholder="seu.email@exemplo.com"
                                    autoComplete="email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 shadow-sm text-gray-800 pr-10"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                    <input id="remember" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <label htmlFor="remember" className="ml-2 text-gray-600 select-none"> Lembrar-me </label>
                                </div>
                                <button type="button" onClick={() => navigate('/forgot-password')} className="text-blue-600 hover:text-blue-800 font-medium transition duration-200">
                                    Esqueceu a senha?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition duration-300 shadow-md transform hover:scale-[1.02] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <Loader2 className="animate-spin mr-2 h-5 w-5" /> ENTRANDO...
                                    </span>
                                ) : (
                                    'ENTRAR'
                                )}
                            </button>

                            <div className="relative flex items-center justify-center my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-300"></span>
                                </div>
                                <div className="relative bg-white px-4 text-sm text-gray-500">
                                    OU
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`} // Redireciona para o OAuth
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl bg-white text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition duration-300 transform hover:scale-[1.01]"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                Continuar com Google
                            </button>

                            <p className="text-center text-sm text-gray-600 pt-4">
                                Não tem uma conta?{' '}
                                <button type="button" onClick={() => navigate('/register')} className="text-blue-600 hover:text-blue-800 font-semibold transition duration-200">
                                    Crie uma conta agora!
                                </button>
                            </p>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer aprimorado */}
            <footer className="bg-white text-center text-sm text-gray-500 py-4 shadow-inner border-t border-gray-100">
                ©{new Date().getFullYear()} Questões da Aprovação. Todos os direitos reservados.
            </footer>

            {/* Animações CSS personalizadas */}
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-right {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
                .animate-fade-in-up.delay-100 { animation-delay: 0.1s; }
                .animate-fade-in-up.delay-200 { animation-delay: 0.2s; }
                .animate-fade-in-right { animation: fade-in-right 0.6s ease-out forwards; }
                .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}











