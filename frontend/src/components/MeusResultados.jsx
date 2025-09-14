import React, { useEffect, useState, useMemo } from "react";
import { ArrowLeftIcon, EyeIcon, PhoneIcon, ListBulletIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ContatosModal from "./ui/ContatosModal";
import OutrasListasModal from "./ui/OutrasListasModal";
import { useNavigate } from "react-router-dom";

// --- Sub-componente para Paginação ---
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
    <div className="flex justify-center items-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(1)}
        disabled={paginaAtual === 1}
        className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-white border border-gray-200 shadow-md"
        aria-label="Primeira página"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => onPageChange(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-white border border-gray-200 shadow-md"
        aria-label="Página anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {inicio > 1 && <span className="px-3 py-2 text-gray-500 font-medium">…</span>}
      {paginas.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center font-semibold text-sm ${
            paginaAtual === p
              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
              : "hover:bg-indigo-100 text-gray-700 border-gray-200 bg-white shadow-md"
          } border`}
        >
          {p}
        </button>
      ))}
      {fim < totalPaginas && <span className="px-3 py-2 text-gray-500 font-medium">…</span>}
      <button
        onClick={() => onPageChange(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-white border border-gray-200 shadow-md"
        aria-label="Próxima página"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        onClick={() => onPageChange(totalPaginas)}
        disabled={paginaAtual === totalPaginas}
        className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-white border border-gray-200 shadow-md"
        aria-label="Última página"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

// --- Sub-componente para a Tabela de Resultados ---
const TabelaResultados = ({ resultados, onSalvarDadosExtras, onAbrirContatos, onVerOutrasListas, outrasStatusMap, idListaAtual }) => {
  const estaEmOutrosConcursos = (nome) => {
    if (!outrasStatusMap || !idListaAtual) return false;
    return !!outrasStatusMap[nome];
  };

  // Função para renderizar a badge da categoria
  const renderCategoriaBadge = (categoria) => {
    const getBadgeClasses = (cat) => {
      switch (cat) {
        case "Ampla":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "PPP":
          return "bg-purple-100 text-purple-800 border-purple-200";
        case "PCD":
          return "bg-green-100 text-green-800 border-green-200";
        case "Indígenas":
          return "bg-orange-100 text-orange-800 border-orange-200";
        case "Hipossuficientes":
          return "bg-gray-100 text-gray-800 border-gray-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeClasses(categoria)}`}>
        {categoria}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-lg bg-white mt-8">
      <table className="min-w-full text-sm">
        <thead className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <tr>
            <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Posição</th>
            <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Categoria</th>
            <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Nome</th>
            <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Nota</th>
            <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Situação</th>
            <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Vai Assumir?</th>
            <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Outras Listas</th>
            <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Contatos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {resultados.map((r, index) => (
            <tr
              key={r.id}
              className={`hover:bg-indigo-50 transition-all duration-200 ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              {/* Posição */}
              <td className="px-6 py-5 font-medium text-gray-900 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{r.position}º</span>
                </div>
              </td>

              {/* Categoria */}
              <td className="px-6 py-5 text-gray-700">
                {renderCategoriaBadge(r.category)}
              </td>

              {/* Nome */}
              <td className="px-6 py-5 font-medium text-gray-900 max-w-xs truncate">{r.name}</td>

              {/* Nota */}
              <td className="px-6 py-5 text-gray-700 font-medium whitespace-nowrap">{r.final_score}</td>

              {/* Situação */}
              <td className="px-6 py-5">
                <div className="relative inline-block w-full">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      r.situacao === "Empossado"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : r.situacao === "Nomeado"
                        ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                        : r.situacao === "Convocado"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : r.situacao === "Aguardando Convocação"
                        ? "bg-gray-50 text-gray-800 border-gray-200"
                        : r.situacao === "Termo de Desistência"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : r.situacao === "Excluído da Lista"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : r.situacao === "Tornado sem efeito"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : r.situacao === "Exonerado"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    <span>{r.situacao || "Selecione"}</span>
                  </div>
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

              {/* Vai Assumir? */}
              <td className="px-6 py-5">
                <div className="relative inline-block w-full">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      r.vai_assumir === "SIM"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : r.vai_assumir === "TALVEZ"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : r.vai_assumir === "NÃO"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    <span>{r.vai_assumir || "Selecione"}</span>
                  </div>
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

              {/* Outras Listas */}
              <td className="px-6 py-5">
                <button
                  onClick={() => onVerOutrasListas(r.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    estaEmOutrosConcursos(r.name)
                      ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200"
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" /> Ver
                </button>
              </td>

              {/* Contatos */}
              <td className="px-6 py-5">
                <button
                  onClick={() => onAbrirContatos(r)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    r.contatos
                      ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                  }`}
                >
                  <PhoneIcon className="h-5 w-5" /> {r.contatos ? "Editar" : "Adicionar"}
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
  const [termoBusca, setTermoBusca] = useState("");
  const [totalResultados, setTotalResultados] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } : { "Content-Type": "application/json" };
  };

  const handleSalvarDadosExtras = async (contestResultId, campo, valor) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/contest-results-extra/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ contest_result_id: contestResultId, [campo]: valor }),
      });
      if (!res.ok) throw new Error("Falha ao salvar dados extras");
      setListaResultados((prev) => prev.map((r) => (r.id === contestResultId ? { ...r, [campo]: valor } : r)));
    } catch (err) {
      console.error("Erro ao salvar dados extras:", err);
      alert("Erro ao salvar. Tente novamente.");
    }
  };

  const handleAbrirContatos = (resultado) => {
    setSelectedResultParaModal(resultado);
    setIsContatosModalOpen(true);
  };

  const handleCloseContatosModal = () => {
    setIsContatosModalOpen(false);
    setSelectedResultParaModal(null);
  };

  const handleSaveContatos = async (contatos) => {
    if (!selectedResultParaModal) return;
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/contest-results-extra/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ contest_result_id: selectedResultParaModal.id, contatos: contatos }),
      });
      if (!res.ok) throw new Error("Falha ao salvar contatos");
      setListaResultados((prev) => prev.map((r) => (r.id === selectedResultParaModal.id ? { ...r, contatos } : r)));
      handleCloseContatosModal();
    } catch (err) {
      console.error("Erro ao salvar contatos:", err);
      alert("Erro ao salvar contatos. Tente novamente.");
    }
  };

  const handleVerOutrasListas = async (nome) => {
    setIsLoadingOutrasListas(true);
    setOutrasListasError("");
    setOutrasListasData([]);
    setIsOutrasListasOpen(true);
    try {
      const encodedName = encodeURIComponent(nome);
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/results-by-name/?name=${encodedName}`, { headers });
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

  const buscarResultados = async (pagina = 1) => {
    if (!idListaSelecionada) return;

    setCarregando(true);
    setErro("");

    try {
      const headers = getAuthHeaders();
      const skip = (pagina - 1) * ITENS_POR_PAGINA;

      const res = await fetch(
        `${API_URL}/api/contest-results/${idListaSelecionada}?skip=${skip}&limit=${ITENS_POR_PAGINA}&category=${encodeURIComponent(filtroTipo)}`,
        { headers }
      );

      if (!res.ok) throw new Error("Falha ao carregar resultados");

      const resultadosDaApi = await res.json();

      const resultadosMapeados = resultadosDaApi.map((resultado) => ({
        ...resultado,
        situacao: resultado.extra?.situacao || "Aguardando Convocação",
        vai_assumir: resultado.extra?.vai_assumir || "",
        contatos: resultado.extra?.contatos || null,
      }));

      setListaResultados(resultadosMapeados);

      const resCount = await fetch(`${API_URL}/api/contest-results-count/${idListaSelecionada}?category=${encodeURIComponent(filtroTipo)}`, { headers });
      if (resCount.ok) {
        const { total } = await resCount.json();
        setTotalResultados(total);
      } else {
        setTotalResultados(resultadosDaApi.length);
      }
    } catch (err) {
      console.error("Erro ao buscar resultados:", err);
      setErro("Erro ao carregar resultados. Tente novamente.");
      setListaResultados([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (idListaSelecionada && filtroTipo) {
      setPaginaAtual(1);
      buscarResultados(1);
    }
  }, [idListaSelecionada, filtroTipo]);

  const totalPaginas = Math.ceil(totalResultados / ITENS_POR_PAGINA);

  const concursosAgrupados = useMemo(() => {
    if (!todosConcursos || todosConcursos.length === 0) return new Map();
    const grupos = new Map();
    todosConcursos.forEach((concurso) => {
      const nomeBase = concurso.name?.split(" - ")[0] || concurso.name || "Sem nome";
      if (!grupos.has(nomeBase)) grupos.set(nomeBase, []);
      grupos.get(nomeBase).push(concurso);
    });
    return grupos;
  }, [todosConcursos]);

  const listasDisponiveis = useMemo(() => {
    if (!concursoAgrupadoSelecionado) return [];
    return concursosAgrupados.get(concursoAgrupadoSelecionado) || [];
  }, [concursosAgrupados, concursoAgrupadoSelecionado]);

  const concursosFiltrados = useMemo(() => {
    if (!concursosAgrupados) return [];
    const grupos = Array.from(concursosAgrupados.entries());
    if (!termoBusca.trim()) return grupos;
    return grupos.filter(([nomeBase]) => nomeBase.toLowerCase().includes(termoBusca.toLowerCase()));
  }, [concursosAgrupados, termoBusca]);

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
          body: JSON.stringify({
            names: nomes,
            exclude_contest_id: parseInt(idListaSelecionada),
          }),
        });
        if (!res.ok) throw new Error("Falha na requisição em lote");
        const data = await res.json();
        if (!cancelado) setOutrasStatusMap(data);
      } catch (err) {
        console.error("Erro ao carregar status em lote:", err);
        if (!cancelado) setOutrasStatusMap({});
      }
    }
    if (idListaSelecionada) carregarStatus();
    return () => { cancelado = true; };
  }, [API_URL, listaResultados, idListaSelecionada]);

  if (carregando && todosConcursos.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (erro && todosConcursos.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl shadow-xl max-w-md mx-auto mt-20 border border-gray-100">
        <div className="text-rose-600 font-semibold mb-6 text-xl">⚠️ {erro}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 font-semibold shadow-lg"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (concursoAgrupadoSelecionado) {
    return (
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <button
          onClick={() => {
            setConcursoAgrupadoSelecionado(null);
            setIdListaSelecionada("");
            setListaResultados([]);
          }}
          className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-all duration-300 font-semibold text-lg"
        >
          <ArrowLeftIcon className="h-6 w-6" /> Voltar
        </button>
        <h2 className="text-4xl font-bold text-gray-900 mb-10 tracking-tight">{concursoAgrupadoSelecionado}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecione a Lista</label>
            <select
              value={idListaSelecionada}
              onChange={(e) => {
                setIdListaSelecionada(e.target.value);
                setFiltroTipo("Ampla");
              }}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 bg-white shadow-md transition-all duration-300 focus:border-indigo-500 outline-none text-gray-700"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 bg-white shadow-md transition-all duration-300 focus:border-indigo-500 outline-none text-gray-700"
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
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        )}

        {erro && <p className="text-center text-rose-600 mt-6 font-semibold text-lg">{erro}</p>}

        {listaResultados.length > 0 && (
          <>
            <TabelaResultados
              resultados={listaResultados}
              onSalvarDadosExtras={handleSalvarDadosExtras}
              onAbrirContatos={handleAbrirContatos}
              onVerOutrasListas={handleVerOutrasListas}
              outrasStatusMap={outrasStatusMap}
              idListaAtual={idListaSelecionada}
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
          <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-dashed border-gray-200 mt-8">
            <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-300 mb-6" />
            <p className="text-xl font-semibold text-gray-700">Nenhum resultado encontrado para a categoria "{filtroTipo}" nesta lista.</p>
          </div>
        )}

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

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-10 tracking-tight">Verifique seus resultados</h2>
      <div className="flex justify-between items-center mb-12 gap-6 flex-wrap">
        <div className="relative flex-grow max-w-lg">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome do concurso..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 bg-white shadow-md transition-all duration-300 focus:border-indigo-500 outline-none text-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {concursosFiltrados.map(([nomeBase, concursosDoGrupo]) => (
          <div
            key={nomeBase}
            onClick={() => setConcursoAgrupadoSelecionado(nomeBase)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer p-6 border border-transparent hover:border-indigo-200 group transform hover:-translate-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition truncate">{nomeBase}</h3>
              <EyeIcon className="h-6 w-6 text-indigo-500 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <p className="text-sm text-gray-500 mt-3 font-medium">{concursosDoGrupo.length} lista(s) disponível(is)</p>
          </div>
        ))}
      </div>

      {!carregando && concursosFiltrados.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md mt-10 border border-dashed border-gray-200">
          <MagnifyingGlassIcon className="h-20 w-20 mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-3">Nenhum concurso encontrado</h3>
          <p className="text-gray-500 text-lg">Tente ajustar os termos da sua busca.</p>
        </div>
      )}

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








