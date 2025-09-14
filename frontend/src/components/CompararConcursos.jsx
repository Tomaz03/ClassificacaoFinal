import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft, GitCompare, FileDown, Loader2 } from "lucide-react";

export default function CompararConcursos() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [contest1, setContest1] = useState("");
  const [contest2, setContest2] = useState("");
  const [results, setResults] = useState([]);
  const [contest1Name, setContest1Name] = useState("");
  const [contest2Name, setContest2Name] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);

  const categoryOrder = { Ampla: 1, PPP: 2, PCD: 3, Indígena: 4 };

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

  const norm = (s) =>
    String(s ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");

  const keyTriplo = (name, category, position) =>
    `${norm(name)}|${norm(category)}|${String(position ?? "").trim()}`;

  useEffect(() => {
    const headers = getAuthHeaders();
    fetch(`${API_URL}/api/contests/`, { headers })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => (Array.isArray(data) ? setContests(data) : setContests([])))
      .catch((error) => {
        console.error("Erro ao carregar concursos:", error);
        setContests([]);
      });
  }, [API_URL]);

  const handleCompare = async () => {
    if (!contest1 || !contest2) {
      alert("Por favor, selecione dois concursos para comparar.");
      return;
    }
    setIsLoading(true);
    setHasCompared(true);

    const c1 = contests.find((c) => c.id === parseInt(contest1));
    const c2 = contests.find((c) => c.id === parseInt(contest2));
    setContest1Name(c1 ? c1.name : "Concurso 1");
    setContest2Name(c2 ? c2.name : "Concurso 2");

    const headers = getAuthHeaders();

    try {
      const resCompare = await fetch(
        `${API_URL}/api/contests/compare/${contest1}/${contest2}`,
        { headers }
      );

      if (!resCompare.ok) {
        throw new Error(`Erro na comparação: HTTP ${resCompare.status}`);
      }

      const dataCompare = await resCompare.json();
      let matches = dataCompare.matches || [];

      // Ordena por categoria e posição
      matches.sort((a, b) => {
        const catA = a.contest_1[0]?.category || "ZZZ";
        const catB = b.contest_1[0]?.category || "ZZZ";
        const orderCatA = categoryOrder[catA] || 99;
        const orderCatB = categoryOrder[catB] || 99;
        if (orderCatA !== orderCatB) return orderCatA - orderCatB;
        const posA = a.contest_1[0]?.position ?? 999999;
        const posB = b.contest_1[0]?.position ?? 999999;
        return posA - posB;
      });

      setResults(matches);
    } catch (err) {
      console.error("Erro na comparação:", err);
      alert(`Erro ao comparar concursos: ${err.message}`);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const obterSituacao = (lado, rName, c) => {
    const maps = lado === 1 ? extrasMap1 : extrasMap2;
    const idx = lado === 1 ? indexC1 : indexC2;
    const tryIds = [c?.contest_result_id, c?.id].filter((v) => v != null);
    for (const id of tryIds) {
      const s = maps.get(id);
      if (s) return s;
    }
    const key = keyTriplo(rName, c?.category, c?.position);
    const resultId = idx.get(key);
    if (resultId) {
      const s = maps.get(resultId);
      if (s) return s;
    }
    return "Aguardando";
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Comparação de Concursos", 14, 15);
    doc.setFontSize(12);
    doc.text(`${contest1Name} vs ${contest2Name}`, 14, 25);

    autoTable(doc, {
      html: "#resultsTable",
      startY: 35,
      styles: { fontSize: 10, textColor: [0, 0, 0] },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    doc.save("comparacao_concursos.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10">
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
              <h1 className="text-3xl font-extrabold tracking-tight">Comparar Listas de Concursos</h1>
              <p className="text-blue-100 mt-2">Selecione dois concursos para ver os candidatos em comum.</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">1º Concurso</label>
                  <select
                    value={contest1}
                    onChange={(e) => setContest1(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 bg-white shadow-sm transition focus:border-blue-500 outline-none"
                  >
                    <option value="">Selecione o 1º concurso</option>
                    {contests.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">2º Concurso</label>
                  <select
                    value={contest2}
                    onChange={(e) => setContest2(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 bg-white shadow-sm transition focus:border-blue-500 outline-none"
                  >
                    <option value="">Selecione o 2º concurso</option>
                    {contests.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCompare}
                  disabled={isLoading || !contest1 || !contest2}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <GitCompare className="h-5 w-5" />
                  )}
                  {isLoading ? "Comparando..." : "Comparar Concursos"}
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={isLoading || results.length === 0}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <FileDown className="h-5 w-5" />
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="mt-10">
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Carregando resultados...</p>
              </div>
            ) : hasCompared && results.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-dashed border-gray-200">
                <GitCompare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum candidato em comum encontrado</h3>
                <p className="text-gray-500">Tente selecionar outros concursos.</p>
              </div>
            ) : results.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    Resultados da Comparação: <span className="text-blue-600">{contest1Name}</span> vs{" "}
                    <span className="text-green-600">{contest2Name}</span>
                  </h2>
                  <p className="text-gray-600 mt-1">{results.length} candidato(s) em comum</p>
                </div>

                <div className="overflow-x-auto">
                  <table id="resultsTable" className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <tr>
                        <th className="p-5 text-left font-semibold uppercase tracking-wider">Nome do Candidato</th>
                        <th className="p-5 text-left font-semibold uppercase tracking-wider">{contest1Name}</th>
                        <th className="p-5 text-left font-semibold uppercase tracking-wider">{contest2Name}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.map((r, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-blue-50 transition-colors duration-150 ${
                            idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }`}
                        >
                          <td className="p-5 font-medium text-gray-900 max-w-xs truncate">
                            {r.name.toUpperCase()}
                          </td>
                          <td className="p-5 text-gray-700">
                            {r.contest_1.length > 0 ? (
                              r.contest_1.map((c, i) => (
                                <div
                                  key={i}
                                  className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-800"
                                >
                                  <div className="font-medium">{c.category}</div>
                                  <div className="text-sm">
                                    Posição: <span className="font-bold">{c.position}</span> | Situação:{" "}
                                    <span className="font-semibold">{c.situacao || "Não informada"}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">Não encontrado</span>
                            )}
                          </td>
                          <td className="p-5 text-gray-700">
                            {r.contest_2.length > 0 ? (
                              r.contest_2.map((c, i) => (
                                <div
                                  key={i}
                                  className="mb-2 p-3 bg-green-50 rounded-lg border border-green-100 text-green-800"
                                >
                                  <div className="font-medium">{c.category}</div>
                                  <div className="text-sm">
                                    Posição: <span className="font-bold">{c.position}</span> | Situação:{" "}
                                    <span className="font-semibold">{c.situacao || "Não informada"}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">Não encontrado</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-dashed border-gray-200">
                <GitCompare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Pronto para comparar?</h3>
                <p className="text-gray-500">Selecione dois concursos acima e clique em "Comparar Concursos".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}










