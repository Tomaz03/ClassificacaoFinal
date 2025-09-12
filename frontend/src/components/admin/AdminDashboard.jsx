// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [nomeConcurso, setNomeConcurso] = useState("");
  const [banca, setBanca] = useState("");
  const [site, setSite] = useState("");
  const [linkEdital, setLinkEdital] = useState("");
  const [cargo, setCargo] = useState("");
  const [contests, setContests] = useState([]);
  const [editingContest, setEditingContest] = useState(null);
  const [isContestListVisible, setIsContestListVisible] = useState(true);

  const [resultadosPorCategoria, setResultadosPorCategoria] = useState({
    Ampla: { nomes: "", notas: "" },
    PPP: { nomes: "", notas: "" },
    PCD: { nomes: "", notas: "" },
    Indígenas: { nomes: "", notas: "" },
    Hipossuficientes: { nomes: "", notas: "" },
  });
  const [isSavingCategory, setIsSavingCategory] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  // Criar ou atualizar dados do concurso
  const handleCreateOrUpdateContest = async () => {
    if (!nomeConcurso || !banca || !cargo) {
      alert("Preencha o nome do concurso, banca e cargo.");
      return;
    }

    const payload = { name: nomeConcurso, banca, site, edital_url: linkEdital, cargo };
    const method = editingContest ? "PUT" : "POST";
    const url = editingContest
      ? `${API_URL}/api/contests/${editingContest.id}`
      : `${API_URL}/api/contests/`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Falha ao salvar dados do concurso.");
      const updatedContest = await res.json();

      if (editingContest) {
        setContests(contests.map(c => c.id === updatedContest.id ? updatedContest : c));
      } else {
        setContests([...contests, updatedContest]);
        setEditingContest(updatedContest);
      }

      alert(`Concurso ${editingContest ? 'atualizado' : 'criado'} com sucesso!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar dados do concurso.");
    }
  };

  // Carregar resultados por categoria
  const carregarResultadosDoConcurso = async (contestId) => {
    try {
      const res = await fetch(`${API_URL}/api/contest-results/${contestId}`);
      if (!res.ok) throw new Error("Falha ao carregar resultados");
      const data = await res.json();

      const agrupado = {
        Ampla: { nomes: [], notas: [] },
        PPP: { nomes: [], notas: [] },
        PCD: { nomes: [], notas: [] },
        Indígenas: { nomes: [], notas: [] },
        Hipossuficientes: { nomes: [], notas: [] },
      };

      data.forEach((r) => {
        if (agrupado[r.category]) {
          agrupado[r.category].nomes.push(r.name);
          agrupado[r.category].notas.push(String(r.final_score).replace(".", ","));
        }
      });

      const novosResultadosState = {};
      for (const categoria in agrupado) {
        novosResultadosState[categoria] = {
          nomes: agrupado[categoria].nomes.join("\n"),
          notas: agrupado[categoria].notas.join("\n"),
        };
      }
      setResultadosPorCategoria(novosResultadosState);
  } catch (err) {
    console.error("Erro ao carregar resultados:", err);
    // Limpa os campos em caso de erro
    setResultadosPorCategoria({
      Ampla: { nomes: "", notas: "" },
      PPP: { nomes: "", notas: "" },
      PCD: { nomes: "", notas: "" },
      Indígenas: { nomes: "", notas: "" },
      Hipossuficientes: { nomes: "", notas: "" },
    });
  }
};

  // Selecionar concurso para edição
  const handleEditContest = async (contest) => {
    setEditingContest(contest);
    setNomeConcurso(contest.name);
    setBanca(contest.banca);
    setSite(contest.site);
    setLinkEdital(contest.edital_url);
    setCargo(contest.cargo);
    setIsContestListVisible(false);
    await carregarResultadosDoConcurso(contest.id);
  };

  // Salvar categoria específica
  const handleSalvarCategoria = async (categoria) => {
    if (!editingContest) {
      alert("Primeiro, selecione ou crie um concurso.");
      return;
    }

    setIsSavingCategory(categoria);

    const { nomes: nomesStr, notas: notasStr } = resultadosPorCategoria[categoria];
    const nomesArray = nomesStr.split("\n").map(n => n.trim()).filter(Boolean);
    const notasArray = notasStr.split("\n").map(n => n.trim()).filter(Boolean);

    if (nomesArray.length !== notasArray.length) {
      alert(`Erro na categoria ${categoria}: quantidade de nomes e notas não confere.`);
      setIsSavingCategory(null);
      return;
    }

    try {
      // 1. Apagar resultados da categoria
      await fetch(`${API_URL}/api/contest-results/${editingContest.id}/${categoria}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      // 2. Se houver novos dados, insere-os
      if (nomesArray.length > 0) {
        await fetch(`${API_URL}/api/contest-results/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            contest_id: editingContest.id,
            category: categoria,
            names: nomesArray,
            final_scores: notasArray.map(n => parseFloat(n.replace(",", "."))),
          }),
        });
      }

      alert(`Categoria ${categoria} salva com sucesso!`);
    } catch (err) {
      console.error(err);
      alert(`Erro ao salvar a categoria ${categoria}.`);
    } finally {
      setIsSavingCategory(null);
    }
  };

  // Função para lidar com a mudança nos textareas
const handleResultadoChange = (categoria, tipo, valor) => {
  setResultadosPorCategoria(prev => ({
    ...prev,
    [categoria]: {
      ...prev[categoria],
      [tipo]: valor,
    },
  }));
};

  // Excluir concurso
  const handleDeleteContest = async (id) => {
    if (!window.confirm("Deseja realmente excluir este concurso e TODOS os seus resultados?")) return;
    try {
      await fetch(`${API_URL}/api/contests/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      setContests(contests.filter((c) => c.id !== id));
    // Limpa os campos se o concurso deletado era o que estava em edição
    if (editingContest && editingContest.id === id) {
        setEditingContest(null);
        setNomeConcurso("");
        setBanca("");
        setSite("");
        setLinkEdital("");
        setCargo("");
        setResultadosPorCategoria({ Ampla: { nomes: "", notas: "" }, PPP: { nomes: "", notas: "" }, PCD: { nomes: "", notas: "" }, Indígenas: { nomes: "", notas: "" }, Hipossuficientes: { nomes: "", notas: "" } });
    }
  } catch (err) {
    console.error("Erro ao excluir concurso:", err);
    alert("Erro ao excluir concurso.");
  }
};

  useEffect(() => {
  if (token === undefined) return; // evita rodar no carregamento inicial
  if (!token) {
    navigate('/login', { replace: true });
  }
}, [token, navigate]);

  // 🔹 Buscar concursos apenas quando houver token
  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/contests/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Falha ao carregar concursos");
          return res.json();
        })
        .then((data) => setContests(data))
        .catch((err) => console.error("Erro ao carregar concursos", err));
    }
  }, [token, API_URL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-inter">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Painel do Administrador – Resultados</h1>
        <button
          onClick={logout}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <LogOut className="mr-2" size={20} /> Sair
        </button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-4">Gerenciar Resultados de Concursos</h2>
            
            <div className="space-y-4 p-4 border rounded-lg mb-6 bg-gray-50">
              <h3 className="text-lg font-semibold">
                {editingContest ? `Editando Concurso: ${editingContest.name}` : "1. Crie um Novo Concurso"}
              </h3>
              
              <input type="text" placeholder="Nome do Concurso" className="w-full border rounded p-2" value={nomeConcurso} onChange={(e) => setNomeConcurso(e.target.value)} />
              <input type="text" placeholder="Banca" className="w-full border rounded p-2" value={banca} onChange={(e) => setBanca(e.target.value)} />
              <input type="text" placeholder="Site" className="w-full border rounded p-2" value={site} onChange={(e) => setSite(e.target.value)} />
              <input type="text" placeholder="Link do Edital" className="w-full border rounded p-2" value={linkEdital} onChange={(e) => setLinkEdital(e.target.value)} />
              <input type="text" placeholder="Cargo" className="w-full border rounded p-2" value={cargo} onChange={(e) => setCargo(e.target.value)} />

              <button onClick={handleCreateOrUpdateContest} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                {editingContest ? "Atualizar Dados do Concurso" : "Salvar Novo Concurso"}
              </button>
            </div>

  {/* ✅ Lista de Concursos Salvos com Botão de Ocultar/Mostrar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">2. Selecione um Concurso para Adicionar Resultados</h3>
                <button
                  onClick={() => setIsContestListVisible(!isContestListVisible)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  title={isContestListVisible ? "Ocultar lista" : "Mostrar lista"}
                >
                  {isContestListVisible ? (
                    <>
                      <EyeOff className="mr-2 h-5 w-5" />
                      Ocultar Lista
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-5 w-5" />
                      Mostrar Lista
                    </>
                  )}
                </button>
              </div>

              {/* ✅ A lista agora é renderizada condicionalmente */}
              {isContestListVisible && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 overflow-hidden"
                >
                  {contests.map((c) => (
                    <li key={c.id} className={`border p-2 rounded flex justify-between items-center ${editingContest?.id === c.id ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50'}`}>
                      <span>{c.name} - {c.banca}</span>
                      <div className="space-x-2">
                        <button className="bg-yellow-500 text-white px-2 py-1 rounded text-sm" onClick={() => handleEditContest(c)}>
                          Carregar/Editar
                        </button>
                        <button className="bg-red-500 text-white px-2 py-1 rounded text-sm" onClick={() => handleDeleteContest(c.id)}>
                          Excluir
                        </button>
                      </div>
                    </li>
                  ))}
                </motion.ul>
              )}
            </div>

            <hr className="my-6" />

  {/* Seção de Resultados por Categoria */}
  {editingContest && (
    <div>
      <h3 className="text-xl font-bold mb-4">Resultados para: {editingContest.name}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["Ampla", "PPP", "PCD", "Indígenas", "Hipossuficientes" ].map((categoria) => (
          <div key={categoria} className="border p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-3">{`Categoria: ${categoria}`}</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nomes (um por linha)</label>
                <textarea
                  placeholder={`Cole os nomes da categoria ${categoria}...`}
                  className="w-full border rounded p-2 h-40"
                  value={resultadosPorCategoria[categoria]?.nomes || ""}
                  onChange={(e) => handleResultadoChange(categoria, 'nomes', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notas Finais (na mesma ordem dos nomes)</label>
                <textarea
                  placeholder={`Cole as notas da categoria ${categoria}...`}
                  className="w-full border rounded p-2 h-40"
                  value={resultadosPorCategoria[categoria]?.notas || ""}
                  onChange={(e) => handleResultadoChange(categoria, 'notas', e.target.value)}
                />
              </div>
              <button
                onClick={() => handleSalvarCategoria(categoria)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isSavingCategory === categoria}
              >
                {isSavingCategory === categoria ? 'Salvando...' : `Salvar Categoria ${categoria}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
      </motion.div>
    </div>
  );
}



