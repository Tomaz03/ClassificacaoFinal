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

  const [extrasMap1, setExtrasMap1] = useState(new Map());
  const [extrasMap2, setExtrasMap2] = useState(new Map());
  const [indexC1, setIndexC1] = useState(new Map());
  const [indexC2, setIndexC2] = useState(new Map());

  const categoryOrder = { Ampla: 1, PPP: 2, PCD: 3, Indígena: 4 };

  const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

  // Em src/components/CompararConcursos.jsx
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
    // ✅ CORREÇÃO: Usando caminho relativo para o proxy
    fetch(`/api/contests/`, { headers })
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? setContests(data) : setContests([])))
      .catch(() => setContests([]));
  }, []); // ✅ CORREÇÃO: Removido API_URL das dependências

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
      // ✅ CORREÇÃO: Usando caminhos relativos para o proxy
      const resCompare = await fetch(`/api/contests/compare/${contest1}/${contest2}`, { headers });
      const dataCompare = await resCompare.json();
      let matches = dataCompare.matches || [];

      const [resExtras1, resExtras2] = await Promise.all([
        fetch(`/api/contest-results-extra/by-contest/${contest1}`, { headers }),
        fetch(`/api/contest-results-extra/by-contest/${contest2}`, { headers }),
      ]);
      const extras1 = await resExtras1.json();
      const extras2 = await resExtras2.json();
      setExtrasMap1(new Map((extras1 || []).map((e) => [e.contest_result_id, e.situacao || "Aguardando"])));
      setExtrasMap2(new Map((extras2 || []).map((e) => [e.contest_result_id, e.situacao || "Aguardando"])));

      const [resList1, resList2] = await Promise.all([
        fetch(`/api/contest-results/${contest1}`, { headers }),
        fetch(`/api/contest-results/${contest2}`, { headers }),
      ]);
      const list1 = await resList1.json();
      const list2 = await resList2.json();
      setIndexC1(new Map((list1 || []).map((r) => [keyTriplo(r.name, r.category, r.position), r.id])));
      setIndexC2(new Map((list2 || []).map((r) => [keyTriplo(r.name, r.category, r.position), r.id])));

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
      console.error(err);
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} className="mr-2" />
              Voltar
            </button>
          </header>

          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Comparar Listas de Concursos</h1>
            <p className="text-gray-600 mb-6">Selecione dois concursos para ver os candidatos em comum.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <select
                value={contest1}
                onChange={(e) => setContest1(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o 1º concurso</option>
                {contests.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={contest2}
                onChange={(e) => setContest2(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o 2º concurso</option>
                {contests.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCompare}
                disabled={isLoading || !contest1 || !contest2}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GitCompare className="mr-2 h-5 w-5" />}
                Comparar
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isLoading || results.length === 0}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FileDown className="mr-2 h-5 w-5" />
                Baixar PDF
              </button>
            </div>
          </div>

          <div className="mt-8">
            {isLoading ? (
              <div className="text-center py-16">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
              </div>
            ) : hasCompared && results.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <p className="text-gray-600 font-semibold text-lg">Nenhum candidato em comum encontrado.</p>
              </div>
            ) : results.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <table id="resultsTable" className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr className="text-left text-gray-700 font-bold uppercase">
                      <th className="p-4">Nome</th>
                      <th className="p-4">{contest1Name}</th>
                      <th className="p-4">{contest2Name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((r, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-800">{r.name.toUpperCase()}</td>
                        <td className="p-4 text-black-600">
                          {r.contest_1.map((c, i) => (
                            <div key={i}>
                              {c.category} - Posição {c.position} ({obterSituacao(1, r.name, c)})
                            </div>
                          ))}
                        </td>
                        <td className="p-4 text-black-600">
                          {r.contest_2.map((c, i) => (
                            <div key={i}>
                              {c.category} - Posição {c.position} ({obterSituacao(2, r.name, c)})
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">Selecione dois concursos e clique em "Comparar".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}











