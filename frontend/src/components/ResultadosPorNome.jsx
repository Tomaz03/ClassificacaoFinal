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

  // ✅ CORREÇÃO: Usar URL absoluta do backend
  const API_URL = import.meta.env.VITE_API_URL || "https://classificacaofinal-backend.onrender.com";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
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
      const res = await fetch(`${API_URL}/api/results-by-name/?name=${encodeURIComponent(nome)}`, { headers });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Acesso não autorizado. Por favor, faça login novamente.");
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error("Erro de configuração: requisição redirecionada para o frontend. Verifique a configuração do proxy.");
        }
        throw new Error(`Erro ao buscar resultados (${res.status}): ${res.statusText}`);
      }

      const data = await res.json();
      setResultados(data);
    } catch (err) {
      console.error("Erro na busca:", err);
      setError(err.message);
      setResultados([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Voltar
            </button>
          </header>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-transform hover:shadow-2xl">
            <div className="p-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h1 className="text-3xl font-extrabold tracking-tight">Buscar Candidato por Nome</h1>
              <p className="text-blue-100 mt-2">Encontre todas as participações de um candidato em qualquer concurso.</p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Digite o nome completo do candidato"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 bg-white shadow-sm transition focus:border-blue-500 outline-none text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Buscar Candidato"}
                </button>
              </form>

              {/* Loading State */}
              {isLoading && (
                <div className="bg-gray-50 rounded-xl p-12 text-center border border-dashed border-gray-200">
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">Buscando resultados...</h3>
                  <p className="text-gray-500 mt-2">Aguarde enquanto buscamos todas as participações de <strong>{nome}</strong>.</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <div className="text-red-600 font-semibold mb-2">⚠️ Ocorreu um erro</div>
                  <p className="text-red-700">{error}</p>
                  <p className="text-red-500 text-sm mt-2">Tente novamente mais tarde ou verifique sua conexão.</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && buscaRealizada && resultados.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-200">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-600">Não encontramos participações para <strong>“{nome}”</strong>.</p>
                  <p className="text-sm text-gray-400 mt-2">Verifique a ortografia ou tente um nome diferente.</p>
                </div>
              )}

              {/* Results */}
              {!isLoading && !error && resultados.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Resultados encontrados</h2>
                    <p className="text-gray-600 mt-1">
                      Mostrando <span className="font-semibold">{resultados.length}</span> participações para <strong>{nome}</strong>.
                    </p>
                  </div>

                  {resultados.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                            {item.contest?.name || "Nome do concurso não disponível"}
                          </h3>
                          <p className="text-blue-600 font-medium text-sm mt-1">
                            {item.contest?.cargo || "Cargo não disponível"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${
                            item.category === "Ampla"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : item.category === "PPP"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : item.category === "PCD"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : item.category === "Indígenas"
                              ? "bg-orange-100 text-orange-800 border border-orange-200"
                              : item.category === "Hipossuficientes"
                              ? "bg-pink-100 text-pink-800 border border-pink-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {item.category || "Categoria não informada"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Posição</div>
                            <div className="text-lg font-bold text-gray-800">{item.position}º</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Nota Final</div>
                            <div className="text-lg font-bold text-gray-800">{item.final_score}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-2 bg-yellow-50 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Situação</div>
                            <div className="text-lg font-bold text-gray-800">
                              {item.extra?.situacao || "Aguardando Convocação"}
                            </div>
                          </div>
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












