import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, ArrowLeft } from "lucide-react";

export default function ResultadosPorNome() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [resultados, setResultados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token"); // ✅ CORREÇÃO
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        "Content-Type": "application/json",
      };
};

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setIsLoading(true);
    setError(null);
    setBuscaRealizada(true);

    try {
      const headers = getAuthHeaders();
      // ✅ CORREÇÃO: Usando caminho relativo para o proxy
      const res = await fetch(`/api/results-by-name/?name=${encodeURIComponent(nome)}`, { headers });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Acesso não autorizado. Por favor, faça login novamente.");
        }
        throw new Error(`Erro ao buscar resultados (${res.status})`);
      }
      const data = await res.json();
      setResultados(data);
    } catch (err) {
      setError(err.message);
      setResultados([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} className="mr-2" />
              Voltar
            </button>
          </header>

          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Buscar por Nome</h1>
            <p className="text-gray-600 mb-6">Encontre todas as participações de um candidato em qualquer concurso.</p>

            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Digite o nome completo do candidato"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Procurar"}
              </button>
            </form>

            <div className="mt-6">
              {isLoading && (
                <div className="text-center py-10">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Buscando resultados...</p>
                </div>
              )}
              {error && (
                <div className="text-center py-8 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium">Erro: {error}</p>
                  <p className="text-red-500 text-sm mt-1">Tente novamente mais tarde.</p>
                </div>
              )}

              {!isLoading && !error && buscaRealizada && resultados.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-600 text-lg">Nenhum resultado encontrado para "{nome}".</p>
                  <p className="text-sm text-gray-400 mt-1">Verifique o nome digitado e tente novamente.</p>
                </div>
              )}

              {!isLoading && !error && resultados.length > 0 && (
                <div className="space-y-5">
                  {resultados.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {item.contest?.name || "Nome do concurso não disponível"}
                          </h3>
                          <p className="text-blue-600 font-medium text-sm">
                            {item.contest?.cargo || "Cargo não disponível"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${
                            item.category === "Ampla"
                              ? "bg-blue-100 text-blue-800"
                              : item.category === "PPP"
                              ? "bg-purple-100 text-purple-800"
                              : item.category === "PCD"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span><strong>Posição:</strong> {item.position}º</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span><strong>Nota:</strong> {item.final_score}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span><strong>Situação:</strong> {item.extra?.situacao || "Aguardando Convocação"}</span>
                        </div>
                      </div>
                    </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}












