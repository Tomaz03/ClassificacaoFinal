import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react'; // Importa ícones de olho e loader
import MessageModal from '../ui/MessageModal'; // Importa o MessageModal
import logo from '../../assets/logo.png'; // Verifique se este caminho está correto!

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            setMessage('As senhas não coincidem.');
            setMessageType('error');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Cadastro realizado com sucesso! Aguarde a aprovação do administrador.');
                setMessageType('success');
                // Redireciona para a página de login após um pequeno atraso
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setMessage(data.detail || 'Erro ao cadastrar. Tente novamente.');
                setMessageType('error');
            }
        } catch (err) {
            console.error('Erro de conexão:', err);
            setMessage('Erro de conexão com o servidor. Tente novamente mais tarde.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
            if (messageType !== 'success') {
                setTimeout(() => setMessage(''), 5000); // Limpa a mensagem de erro após 5 segundos
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col font-inter">
            {/* Mensagens de Status Flutuantes */}
            {message && (
                <MessageModal
                    message={message}
                    type={messageType}
                    onClose={() => setMessage('')}
                />
            )}

            {/* Header aprimorado */}
            <header className="bg-white shadow-lg px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    {/* Verifique o caminho do logo. Se não tiver, remova esta linha. */}
                    <img src={logo} alt="Questões da Aprovação Logo" className="h-16 sm:h-20 w-auto object-contain mt-1" />
                </div>
                <nav>
                    <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-800 font-semibold px-4 py-2 rounded-lg transition duration-300">
                        Login
                    </button>
                </nav>
            </header>

            <main className="flex-grow flex items-center justify-center px-4 py-12 md:py-16">
                <div className="w-full max-w-5xl bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transform transition-all duration-500 ease-in-out scale-95 md:scale-100 hover:scale-[1.01]">
                    {/* Seção de Marketing/Benefícios (Lado Esquerdo) */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex flex-col justify-center space-y-6">
                        <h2 className="text-4xl font-extrabold leading-tight tracking-tight animate-fade-in-up">
                            Comece sua Jornada de <span className="text-yellow-300">Aprovação</span>!
                        </h2>
                        <p className="text-lg leading-relaxed opacity-90 animate-fade-in-up delay-100">
                            Cadastre-se agora e tenha acesso a um universo de questões para turbinar seus estudos.
                        </p>
                        <ul className="space-y-3 text-sm opacity-95 animate-fade-in-up delay-200">
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-300 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Milhares de questões de concursos
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-300 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Conteúdo completo e atualizado
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-300 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Ferramentas de estudo inteligentes
                            </li>
                        </ul>
                        <div className="space-y-4 pt-6">
                            <button onClick={() => navigate('/login')} className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transform transition duration-300">
                                JÁ TENHO UMA CONTA
                            </button>
                        </div>
                    </div>

                    {/* Formulário de Cadastro (Lado Direito) */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 space-y-7 animate-fade-in-right">
                        <h2 className="text-3xl font-bold text-gray-900 text-center">Crie sua Conta</h2>
                        <p className="text-center text-gray-600 text-sm">Preencha seus dados para começar.</p>

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">Nome de Usuário</label>
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 shadow-sm text-gray-800"
                                    placeholder="Seu nome de usuário"
                                    autoComplete="username"
                                />
                            </div>

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
                                        autoComplete="new-password"
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

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Senha</label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 shadow-sm text-gray-800 pr-10"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        aria-label={showConfirmPassword ? 'Esconder senha' : 'Mostrar senha'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition duration-300 shadow-md transform hover:scale-[1.02] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <Loader2 className="animate-spin mr-2 h-5 w-5" /> CADASTRANDO...
                                    </span>
                                ) : (
                                    'CADASTRAR'
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-600 pt-4">
                                Já tem uma conta?{' '}
                                <button type="button" onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-800 font-semibold transition duration-200">
                                    Faça login aqui!
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
            <style jsx>{`
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




