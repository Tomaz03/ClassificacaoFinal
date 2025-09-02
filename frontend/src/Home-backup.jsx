import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between shadow-md z-10" style={{ minHeight: '64px' }}>
        <div className="flex items-center gap-3">
          <img src={logo} alt="Questões da Aprovação Logo" className="h-16 sm:h-20 w-auto object-contain" />
          <span className="text-xl sm:text-2xl font-bold hidden sm:inline">Questões da Aprovação</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-gray-800 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Login
        </button>
      </header>

      {/* Seção principal */}
      <main className="flex flex-col items-center text-center bg-blue-600 px-6 py-16">
        <h1 className="text-3xl sm:text-5xl font-bold mb-6 text-white">Bem-vindo ao Questões da Aprovação!</h1>
        <p className="text-lg sm:text-xl max-w-3xl mb-8 leading-relaxed text-white text-justify">
          Preparar-se para um concurso público nunca foi tão dinâmico e eficiente! Aqui você encontra a ferramenta ideal para turbinar seus estudos e conquistar a tão sonhada vaga. Resolver questões é o segredo dos aprovados – é com a prática que você fixa o conteúdo, entende os padrões das provas e ganha confiança para o grande dia.
        </p>
        <button
          onClick={() => navigate('/register')}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          CADASTRE-SE GRATUITAMENTE
        </button>
      </main>

      {/* Benefícios */}
      <section className="py-12 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
          <div className="text-5xl mb-3 text-pink-500">🧠</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Pratique com questões reais</h3>
          <p className="text-gray-600 text-justify">Milhares de questões de concursos anteriores para você dominar os temas e ganhar segurança.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
          <div className="text-5xl mb-3 text-blue-500">📊</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Acompanhe sua evolução</h3>
          <p className="text-gray-600 text-justify">Relatórios e gráficos que mostram onde melhorar e como evoluir com eficiência.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
          <div className="text-5xl mb-3 text-teal-500">🚀</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Estude onde e quando quiser</h3>
          <p className="text-gray-600 text-justify">Acesse do celular ou computador, com uma interface pensada para seu ritmo de estudo.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
          <div className="text-5xl mb-3 text-yellow-500">🏆</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Rumo à aprovação</h3>
          <p className="text-gray-600 text-justify">Com prática e foco, você acerta mais e fica cada vez mais perto da aprovação.</p>
        </div>
      </section>

      {/* Chamada final */}
      <section className="bg-white text-center py-12 px-4">
        <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto mb-6 text-justify">
          Não deixe para depois o que pode mudar seu futuro hoje. Cadastre-se grátis no <strong>Questões da Aprovação</strong> e comece a transformar seus estudos em resultados.
        </p>
        <p className="text-xl font-semibold text-blue-700 mb-4 text-center">A prática leva à perfeição – e a sua aprovação está a apenas um clique!</p>
        <button
          onClick={() => navigate('/register')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Junte-se à comunidade dos aprovados. Vamos juntos?
        </button>
      </section>

      {/* Rodapé */}
      <footer className="bg-gray-800 text-center text-sm text-gray-300 py-6">
        © {new Date().getFullYear()} Questões da Aprovação. Todos os direitos reservados.
      </footer>
    </div>
  );
}