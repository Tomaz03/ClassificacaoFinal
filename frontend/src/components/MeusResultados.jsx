// src/components/MeusResultados.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ArrowLeftIcon, EyeIcon, PencilIcon, PhoneIcon, ListBulletIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"; 
import ContatosModal from "./ui/ContatosModal";
import OutrasListasModal from "./ui/OutrasListasModal";
import { useNavigate } from "react-router-dom";

// --- Sub-componente para Paginação (modernizado) ---
const Paginacao = ({ paginaAtual, totalPaginas, onPageChange }) => {
  if (totalPaginas <= 1) return null;

  const paginas = [];
  const paginasVisiveis = 5;
  let inicio = Math.max(1, paginaAtual - Math.floor(paginasVisiveis / 2));
  let fim = Math.min(totalPaginas, inicio + paginasVisiveis - 1);
  if (fim - inicio + 1 < paginasVisiveis) {
    inicio = Math.max(1, fim - paginasVisiveis + 1);
  }
  for (let i = inicio; i <= fim; i++) {
    paginas.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(1)}
        disabled={paginaAtual === 1}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        aria-label="Primeira página"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => onPageChange(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        aria-label="Página anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {inicio > 1 && <span className="px-2 py-1 text-gray-500">…</span>}
      {paginas.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-full transition flex items-center justify-center ${
            paginaAtual === p
              ? "bg-blue-600 text-white font-medium"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          {p}
        </button>
      ))}
      {fim < totalPaginas && <span className="px-2 py-1 text-gray-500">…</span>}
      <button
        onClick={() => onPageChange(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        aria-label="Próxima página"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        onClick={() => onPageChange(totalPaginas)}
        disabled={paginaAtual === totalPaginas}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        aria-label="Última página"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

// --- ✅ Sub-componente para a Tabela de Resultados (com badges coloridos) ---
const TabelaResultados = ({
  resultados,
  onSalvarDadosExtras,
  onAbrirContatos,
  onVerOutrasListas,
  outrasStatusMap, 
}) => {

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
          <tr>
            <th className="px-5 py-3 text-left font-semibold text-sm uppercase tracking-wider">Posição</th>
            <th className="px-5 py-3 text-left font-semibold text-sm uppercase tracking-wider">Categoria</th>
            <th className="px-5 py-3 text-left font-semibold text-sm uppercase tracking-wider">Nome</th>
            <th className="px-5 py-3 text-left font-semibold text-sm uppercase tracking-wider">Nota</th>
            <th className="px-5 py-3 text-left font-semibold text-sm uppercase tracking-wider">Situação</th>
            <th className="px-5 py-3 text-left font-semibold text-sm uppercase tracking-wider">Vai Assumir?</th>
            <th className="px-5 py-3 text-left font-semibold text-sm uppercase tracking-wider">Outras Listas</th>
            <th className="px-5 py-3 text-left font-semibold text-sm uppercase tracking-wider">Contatos</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {resultados.map((r) => (
            <tr key={r.id} className="hover:bg-blue-50 transition duration-150">
              <td className="px-5 py-4 font-medium text-gray-900">{r.position}º</td>
              <td className="px-5 py-4 text-gray-600">{r.category}</td>
              <td className="px-5 py-4 font-medium text-gray-900">{r.name}</td>
              <td className="px-5 py-4 text-gray-700">{r.final_score}</td>
              <td className="px-5 py-4">
                <div className="relative inline-block w-full">
                  {/* Badge visual com cor de fundo */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      r.situacao === "Empossado"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : r.situacao === "Nomeado"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : r.situacao === "Convocado"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : r.situacao === "Aguardando Convocação"
                        ? "bg-gray-100 text-gray-800 border border-gray-200"
                        : r.situacao === "Termo de Desistência"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : r.situacao === "Excluído da Lista"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : r.situacao === "Tornado sem efeito"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : r.situacao === "Exonerado"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-gray-50 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {r.situacao && (
                      <>
                        {r.situacao === "Empossado" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {r.situacao === "Nomeado" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {r.situacao === "Convocado" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {r.situacao === "Aguardando Convocação" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {r.situacao === "Termo de Desistência" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {r.situacao === "Excluído da Lista" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                         {r.situacao === "Tornado sem efeito" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {r.situacao === "Exonerado" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span>{r.situacao || "Selecione"}</span>
                      </>
                    )}
                  </div>

                  {/* Dropdown invisível sobre o badge */}
                  <select
                    value={r.situacao}
                    onChange={(e) => onSalvarDadosExtras(r.id, "situacao", e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full w-full"
                  >
                    <option value="">Selecione</option>
                    <option value="Aguardando Convocação">Aguardando Convocação</option>
                    <option value="Convocado">Convocado</option>
                    <option value="Nomeado">Nomeado</option>
                    <option value="Empossado">Empossado</option>
                    <option value="Termo de Desistência">Termo de Desistência</option>
                    <option value="Excluído da Lista">Excluído da Lista</option>
                    <option value="Tornado sem efeito">Tornado sem efeito</option>
                    <option value="Exonerado">Exonerado</option>
                  </select>
                </div>
              </td>
              <td className="px-5 py-4">
  <div className="relative inline-block w-full">
    {/* Badge visual com cor de fundo */}
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        r.vai_assumir === "SIM"
          ? "bg-green-100 text-green-800 border border-green-200"
          : r.vai_assumir === "TALVEZ"
          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
          : r.vai_assumir === "NÃO"
          ? "bg-red-100 text-red-800 border border-red-200"
          : "bg-gray-50 text-gray-500 border border-gray-200"
      }`}
    >
      {r.vai_assumir && (
        <>
          {r.vai_assumir === "SIM" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {r.vai_assumir === "TALVEZ" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {r.vai_assumir === "NÃO" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{r.vai_assumir}</span>
        </>
      )}
    </div>

    {/* Dropdown invisível sobre o badge */}
    <select
      value={r.vai_assumir}
      onChange={(e) => onSalvarDadosExtras(r.id, "vai_assumir", e.target.value)}
      className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full w-full"
    >
      <option value="">Selecione</option>
      <option value="SIM">SIM</option>
      <option value="TALVEZ">TALVEZ</option>
      <option value="NÃO">NÃO</option>
    </select>
  </div>
</td>
              <td className="px-5 py-4">
                <button
                  onClick={() => onVerOutrasListas(r.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition ${
                    outrasStatusMap?.[r.name]
                      ? "bg-green-200 hover:bg-green-300 text-green-900"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                  Ver
                </button>
              </td>
              <td className="px-5 py-4">
                <button
                  onClick={() => onAbrirContatos(r)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition ${
                    r.contatos
                      ? "bg-green-100 hover:bg-green-200 text-green-800"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
  }`}
                >
                  <PhoneIcon className="h-4 w-4" />
                  {r.contatos ? "Editar" : "Adicionar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Componente Principal ---
export default function MeusResultados() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  // --- Estados ---
  const [todosConcursos, setTodosConcursos] = useState([]);
  const [concursoAgrupadoSelecionado, setConcursoAgrupadoSelecionado] = useState(null);
  const [listaResultados, setListaResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [idListaSelecionada, setIdListaSelecionada] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Ampla");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 100;
  const [isContatosModalOpen, setIsContatosModalOpen] = useState(false);
  const [isOutrasListasOpen, setIsOutrasListasOpen] = useState(false);
  const [selectedResultParaModal, setSelectedResultParaModal] = useState(null);
  const [outrasListasData, setOutrasListasData] = useState([]);
  const [isLoadingOutrasListas, setIsLoadingOutrasListas] = useState(false);
  const [outrasListasError, setOutrasListasError] = useState("");
  const [outrasStatusMap, setOutrasStatusMap] = useState({});
  const [searchName, setSearchName] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [totalResultados, setTotalResultados] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Em src/components/MeusResultados.jsx
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token"); // ✅ CORRETO
  return token ? {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  } : {
    "Content-Type": "application/json",
  };
};

  // ✅ CORREÇÃO: Função para salvar dados extras
  const handleSalvarDadosExtras = async (contestResultId, campo, valor) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/contest-results-extra/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          contest_result_id: contestResultId,
          [campo]: valor,
        }),
      });

      if (!res.ok) throw new Error("Falha ao salvar dados extras");

      // Atualizar o estado local
      setListaResultados((prev) =>
        prev.map((r) =>
          r.id === contestResultId ? { ...r, [campo]: valor } : r
        )
      );
    } catch (err) {
      console.error("Erro ao salvar dados extras:", err);
      alert("Erro ao salvar. Tente novamente.");
    }
  };

  // ✅ CORREÇÃO: Função para abrir modal de contatos
  const handleAbrirContatos = (resultado) => {
    setSelectedResultParaModal(resultado);
    setIsContatosModalOpen(true);
  };

  // ✅ CORREÇÃO: Função para fechar modal de contatos
  const handleCloseContatosModal = () => {
    setIsContatosModalOpen(false);
    setSelectedResultParaModal(null);
  };

  // ✅ CORREÇÃO: Função para salvar contatos
  const handleSaveContatos = async (contatos) => {
    if (!selectedResultParaModal) return;

    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/contest-results-extra/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          contest_result_id: selectedResultParaModal.id,
          contatos: contatos,
        }),
      });

      if (!res.ok) throw new Error("Falha ao salvar contatos");

      // Atualizar o estado local
      setListaResultados((prev) =>
        prev.map((r) =>
          r.id === selectedResultParaModal.id ? { ...r, contatos } : r
        )
      );

      handleCloseContatosModal();
    } catch (err) {
      console.error("Erro ao salvar contatos:", err);
      alert("Erro ao salvar contatos. Tente novamente.");
    }
  };

  // ✅ CORREÇÃO: handleVerOutrasListas com autenticação
  const handleVerOutrasListas = async (nome) => {
    setIsLoadingOutrasListas(true);
    setOutrasListasError("");
    setOutrasListasData([]);
    setIsOutrasListasOpen(true);
    
    try {
      const encodedName = encodeURIComponent(nome);
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/results-by-name/?name=${encodedName}`, {
        headers
      });
      
      if (!res.ok) throw new Error("Falha ao buscar dados.");
      
      const data = await res.json();
      setOutrasListasData(data);
    } catch (err) {
      console.error("Erro ao buscar outras listas:", err);
      setOutrasListasError(err.message);
    } finally {
      setIsLoadingOutrasListas(false);
    }
  };

  // ✅ CORREÇÃO: useEffect para carregar concursos
  useEffect(() => {
    async function carregarConcursos() {
      setCarregando(true);
      try {
        const headers = getAuthHeaders();
        const res = await fetch(`${API_URL}/api/contests/`, { headers });
        if (!res.ok) throw new Error("Falha ao carregar concursos");
        const data = await res.json();
        setTodosConcursos(data);
      } catch (err) {
        console.error("Erro ao carregar concursos:", err);
        setErro("Erro ao carregar concursos. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    }
    carregarConcursos();
  }, [API_URL]);

  // ✅ CORREÇÃO: Função para buscar resultados com tratamento de erro 404
  const buscarResultados = async (pagina = 1) => {
    if (!idListaSelecionada) return;

    setCarregando(true);
    setErro("");

    try {
      const headers = getAuthHeaders();
      const skip = (pagina - 1) * ITENS_POR_PAGINA;
      
      // Buscar resultados paginados
      const res = await fetch(
        `${API_URL}/api/contest-results/${idListaSelecionada}?skip=${skip}&limit=${ITENS_POR_PAGINA}&category=${encodeURIComponent(filtroTipo)}`,
        { headers }
      );

      if (!res.ok) throw new Error("Falha ao carregar resultados");

      const resultadosCompletos = await res.json();

      // ✅ CORREÇÃO: Buscar dados extras para cada resultado com tratamento de erro 404
      const resultadosComExtras = await Promise.all(
        resultadosCompletos.map(async (resultado) => {
          try {
            const resExtra = await fetch(`${API_URL}/api/contest-results-extra/${resultado.id}`, { headers });
            if (resExtra.ok) {
              const extra = await resExtra.json();
              return {
                ...resultado,
                situacao: extra.situacao || "Aguardando Convocação",
                vai_assumir: extra.vai_assumir || "",
                contatos: extra.contatos || "",
              };
            } else if (resExtra.status === 404) {
              // ✅ CORREÇÃO: Se não existir dados extras (404), retorna valores padrão
              console.log(`Dados extras não encontrados para resultado ${resultado.id} - usando valores padrão`);
              return {
                ...resultado,
                situacao: "Aguardando Convocação",
                vai_assumir: "",
                contatos: "",
              };
            } else {
              throw new Error(`Erro ${resExtra.status} ao buscar extras`);
            }
          } catch (err) {
            console.error(`Erro ao buscar extras para resultado ${resultado.id}:`, err);
            // ✅ CORREÇÃO: Em caso de erro, retorna valores padrão
            return {
              ...resultado,
              situacao: "Aguardando Convocação",
              vai_assumir: "",
              contatos: "",
            };
          }
        })
      );

      setListaResultados(resultadosComExtras);

      // Buscar total da categoria (para calcular totalPaginas)
      const resCount = await fetch(`${API_URL}/api/contest-results-count/${idListaSelecionada}?category=${encodeURIComponent(filtroTipo)}`, { headers });
      if (resCount.ok) {
        const { total } = await resCount.json();
        setTotalResultados(total);
      } else {
        setTotalResultados(resultadosCompletos.length); // fallback
      }

    } catch (err) {
      console.error("Erro ao buscar resultados:", err);
      setErro("Erro ao carregar resultados. Tente novamente.");
      setListaResultados([]);
    } finally {
      setCarregando(false);
    }
  };

  // ✅ CORREÇÃO: useEffect para buscar resultados quando filtros mudam
  useEffect(() => {
    if (idListaSelecionada && filtroTipo) {
      setPaginaAtual(1);
      buscarResultados(1);
    }
  }, [idListaSelecionada, filtroTipo]);

  // ✅ CORREÇÃO: Cálculo de páginas
  const totalPaginas = Math.ceil(totalResultados / ITENS_POR_PAGINA);

  // ✅ CORREÇÃO: Agrupamento de concursos
  const concursosAgrupados = useMemo(() => {
    if (!todosConcursos || todosConcursos.length === 0) return new Map();
    
    const grupos = new Map();
    todosConcursos.forEach((concurso) => {
      const nomeBase = concurso.name?.split(" - ")[0] || concurso.name || "Sem nome";
      if (!grupos.has(nomeBase)) {
        grupos.set(nomeBase, []);
      }
      grupos.get(nomeBase).push(concurso);
    });
    return grupos;
  }, [todosConcursos]);

  const listasDisponiveis = useMemo(() => {
    if (!concursoAgrupadoSelecionado) return [];
    return concursosAgrupados.get(concursoAgrupadoSelecionado) || [];
  }, [concursosAgrupados, concursoAgrupadoSelecionado]);

  // ✅ CORREÇÃO: Filtro de concursos com verificação de dados
  const concursosFiltrados = useMemo(() => {
    if (!concursosAgrupados) return [];
    
    const grupos = Array.from(concursosAgrupados.entries());
    if (!termoBusca.trim()) return grupos;
    
    return grupos.filter(([nomeBase]) =>
      nomeBase.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [concursosAgrupados, termoBusca]);

  // ✅ CORREÇÃO: useEffect para carregar status em lote com autenticação
  useEffect(() => {
    let cancelado = false;

    async function carregarStatus() {
      if (!listaResultados.length || !idListaSelecionada) return;

      const nomes = listaResultados.map((r) => r.name);
      if (nomes.length === 0) return;

      try {
        const headers = getAuthHeaders();
        const res = await fetch(`${API_URL}/api/results-by-names-batch`, {
          method: "POST",
          headers,
          body: JSON.stringify({ names: nomes }),
        });

        if (!res.ok) throw new Error("Falha na requisição em lote");

        const data = await res.json();
        if (!cancelado) setOutrasStatusMap(data);
      } catch (err) {
        console.error("Erro ao carregar status em lote:", err);
        if (!cancelado) setOutrasStatusMap({});
      }
    }

    if (idListaSelecionada) {
      carregarStatus();
    }

    return () => { cancelado = true; };
  }, [API_URL, listaResultados, idListaSelecionada]);

  // --- Renderização ---
  if (carregando && todosConcursos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (erro && todosConcursos.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 font-medium mb-4">{erro}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // TELA 2: DETALHES DO CONCURSO
  if (concursoAgrupadoSelecionado) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => {
            setConcursoAgrupadoSelecionado(null);
            setIdListaSelecionada("");
            setListaResultados([]);
          }}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Voltar
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">{concursoAgrupadoSelecionado}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecione a Lista</label>
            <select
              value={idListaSelecionada}
              onChange={(e) => {
                setIdListaSelecionada(e.target.value);
                setFiltroTipo("Ampla");
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="">-- Escolha uma lista --</option>
              {listasDisponiveis.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {idListaSelecionada && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              >
                <option value="Ampla">Ampla Concorrência</option>
                <option value="PPP">Pardos/Negros (PPP)</option>
                <option value="PCD">Pessoas com Deficiência (PCD)</option>
                <option value="Indígenas">Indígenas</option>
                <option value="Hipossuficientes">Hipossuficientes</option>
              </select>
            </div>
          )}
        </div>

        {carregando && idListaSelecionada && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {erro && <p className="text-center text-red-500 mt-4">{erro}</p>}

        {listaResultados.length > 0 && (
          <>
            <TabelaResultados 
              resultados={listaResultados} 
              onSalvarDadosExtras={handleSalvarDadosExtras} 
              onAbrirContatos={handleAbrirContatos} 
              onVerOutrasListas={handleVerOutrasListas} 
              outrasStatusMap={outrasStatusMap} 
            />
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              onPageChange={(novaPagina) => {
                setPaginaAtual(novaPagina);
                buscarResultados(novaPagina);
              }}
            />
          </>
        )}

        {!carregando && idListaSelecionada && listaResultados.length === 0 && (
          <p className="text-center text-gray-500 mt-8 py-6 bg-white rounded-lg shadow">
            Nenhum resultado encontrado para a categoria "{filtroTipo}" nesta lista.
          </p>
        )}

        {/* Modais */}
        <ContatosModal
          isOpen={isContatosModalOpen}
          onClose={handleCloseContatosModal}
          onSave={handleSaveContatos}
          initialData={selectedResultParaModal?.contatos}
        />
        <OutrasListasModal
          isOpen={isOutrasListasOpen}
          onClose={() => setIsOutrasListasOpen(false)}
          data={outrasListasData}
          isLoading={isLoadingOutrasListas}
          error={outrasListasError}
        />
      </div>
    );
  }

  // TELA 1: SELEÇÃO DE CONCURSOS (Cards modernos)
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Verifique seus resultados</h2>

      {/* ✅ NOVO LAYOUT: Cabeçalho com busca e botões */}
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        
        {/* Campo de Busca */}
        <div className="relative flex-grow max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome do concurso..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          />
        </div>

        {/* Botões */}
        <div className="flex items-center gap-3">

        </div>
      </div>

      {/* ✅ ATUALIZAÇÃO: Grid de cards agora usa 'concursosFiltrados' */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {concursosFiltrados.map(([nomeBase, concursosDoGrupo]) => (
          <div
            key={nomeBase}
            onClick={() => setConcursoAgrupadoSelecionado(nomeBase)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 border border-gray-100 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition">
                {nomeBase}
              </h3>
              <EyeIcon className="h-5 w-5 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {concursosDoGrupo.length} lista(s) disponível(is)
            </p>
          </div>
        ))}
      </div>
      
      {/* ✅ NOVO: Mensagem para quando a busca não encontra resultados */}
      {!carregando && concursosFiltrados.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm mt-6">
          <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">Nenhum concurso encontrado</h3>
          <p className="text-gray-500 mt-2">Tente ajustar os termos da sua busca.</p>
        </div>
      )}

      {/* Modais */}
      <ContatosModal
        isOpen={isContatosModalOpen}
        onClose={handleCloseContatosModal}
        onSave={handleSaveContatos}
        initialData={selectedResultParaModal?.contatos}
      />
      <OutrasListasModal
        isOpen={isOutrasListasOpen}
        onClose={() => setIsOutrasListasOpen(false)}
        data={outrasListasData}
        isLoading={isLoadingOutrasListas}
        error={outrasListasError}
      />
    </div>
  );
}









