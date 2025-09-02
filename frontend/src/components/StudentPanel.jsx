import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../TopNav';
import MessageModal from '../ui/MessageModal';
import {
  ClipboardList, ThumbsUp, MessageSquare, Book, Star,
  Loader2, FileText, Download, CheckSquare, Square, Search
} from 'lucide-react';

const loadHtml2PdfScript = () => {
  return new Promise((resolve, reject) => {
    if (window.html2pdf) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function StudentPanel({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('anotacoes'); // Estado para a aba ativa
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    if (!token) {
      setMessage('Token de autenticação ausente. Por favor, faça login novamente.');
      setMessageType('error');
      onLogout();
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/notes/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setMessage('Sessão expirada ou não autorizada. Faça login novamente.');
        setMessageType('error');
        onLogout();
        navigate('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Erro ao buscar anotações.');
      }

      const data = await res.json();
      setNotes(data);
      setFilteredNotes(data);
      setMessage('Anotações carregadas com sucesso!');
      setMessageType('success');

    } catch (err) {
      console.error('Erro ao buscar anotações:', err);
      setMessage(`Erro ao carregar anotações: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  }, [token, navigate, onLogout, API_URL]);

  useEffect(() => {
    // Apenas carrega as anotações se a aba ativa for 'anotacoes'
    if (activeTab === 'anotacoes') {
      fetchNotes();
    }
    loadHtml2PdfScript()
      .then(() => console.log('html2pdf.js carregado com sucesso'))
      .catch((err) => console.error('Erro ao carregar html2pdf.js:', err));
  }, [fetchNotes, activeTab]); // Adicionado activeTab como dependência

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = notes.filter(note => {
      const noteMateria = note.materia || '';
      const noteAssunto = note.assunto || '';
      const noteQuestionId = String(note.question_id || '');

      return (
        noteMateria.toLowerCase().includes(lowercasedSearchTerm) ||
        noteAssunto.toLowerCase().includes(lowercasedSearchTerm) ||
        noteQuestionId.includes(lowercasedSearchTerm)
      );
    });
    setFilteredNotes(filtered);
  }, [searchTerm, notes]);

  const handleSelectNote = (noteId) => {
    setSelectedNoteIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(noteId)) {
        newSelected.delete(noteId);
      } else {
        newSelected.add(noteId);
      }
      return newSelected;
    });
  };

  const handleSelectAllNotes = () => {
    if (selectedNoteIds.size === filteredNotes.length && filteredNotes.length > 0) {
      setSelectedNoteIds(new Set());
    } else {
      const allNoteIds = new Set(filteredNotes.map((note) => note.id));
      setSelectedNoteIds(allNoteIds);
    }
  };

  const handleViewNoteDetails = (noteId) => {
    navigate(`/minhas-anotacoes/${noteId}`);
  };

  const handleGeneratePdf = async () => {
    if (selectedNoteIds.size === 0) {
      setMessage('Selecione ao menos uma anotação para gerar o PDF.');
      setMessageType('error');
      return;
    }

    if (!window.html2pdf) {
      setMessage('A biblioteca de PDF ainda não foi carregada. Tente novamente em instantes.');
      setMessageType('error');
      return;
    }

    setMessage('Gerando PDF... Isso pode levar alguns segundos.');
    setMessageType('success');

    try {
      const notesToExport = notes.filter(note => selectedNoteIds.has(note.id));

      const contentHtml = `
        <div style="font-family: 'Inter', sans-serif; padding: 20px; color: #333;">
          <h1 style="text-align: center; color: #1a202c; margin-bottom: 30px;">Minhas Anotações</h1>
          ${notesToExport.map(note => {
            const createdAtDate = note.created_at ? new Date(note.created_at) : null;
            const updatedAtDate = note.updated_at ? new Date(note.updated_at) : null;
            
            let dateDisplay = 'Data Indisponível';
            if (updatedAtDate && createdAtDate && updatedAtDate.getTime() !== createdAtDate.getTime()) {
                dateDisplay = `Alterado em: ${updatedAtDate.toLocaleDateString('pt-BR')}`;
            } else if (createdAtDate) {
                dateDisplay = `Criado em: ${createdAtDate.toLocaleDateString('pt-BR')}`;
            }

            return `
            <div style="margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
              <h2 style="color: #2c5282; margin-bottom: 10px;">Anotação da Questão ID: ${note.question_id || 'N/A'}</h2>
              <p style="font-size: 0.9em; color: #718096; margin-bottom: 5px;">
                Matéria: ${note.materia || 'N/A'} | Assunto: ${note.assunto || 'N/A'}
              </p>
              <p style="font-size: 0.9em; color: #718096; margin-bottom: 15px;">
                ${dateDisplay}
              </p>
              <div style="line-height: 1.6; word-wrap: break-word;">
                ${note.content || 'Sem conteúdo.'}
              </div>
            </div>
          `;
          }).join('')}
        </div>
      `;

      const options = {
        margin: 10,
        filename: 'minhas_anotacoes.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await window.html2pdf().set(options).from(contentHtml).save();
      setMessage('PDF gerado com sucesso!');
      setMessageType('success');

    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setMessage(`Erro ao gerar PDF: ${err.message}`);
      setMessageType('error');
    } finally {
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'anotacoes':
        return (
          <div className="flex flex-col min-h-0 h-full">
            <div className="flex-none pb-4">
              <h2 className="text-xl font-bold text-center mb-4">Minhas Anotações</h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative w-full sm:w-1/2">
                  <input
                    type="text"
                    placeholder="Buscar por matéria, assunto ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center text-gray-600">
                  <Loader2 className="animate-spin mr-2" />
                  Carregando anotações...
                </div>
              ) : filteredNotes.length === 0 ? (
                <p className="text-center text-gray-500">Nenhuma anotação encontrada.</p>
              ) : (
                filteredNotes.map(note => (
                  <div key={note.id} className="p-4 bg-gray-50 rounded-lg border shadow-sm">
                    <h3 className="font-semibold">Questão ID: {note.question_id}</h3>
                    <p className="text-sm text-gray-700">
                      Matéria: {note.materia || 'N/A'} | Assunto: {note.assunto || 'N/A'}
                    </p>
                    <p className="text-sm mt-2">{note.content || 'Sem conteúdo.'}</p>
                    <button
                      onClick={() => navigate(`/minhas-anotacoes/${note.id}`)}
                      className="mt-2 text-blue-600 hover:underline text-sm"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'curtidas':
      case 'comentarios':
      case 'teoria':
      case 'favoritas':
        return (
          <div className="flex-1 overflow-y-auto flex flex-col justify-center items-center text-gray-600 p-6">
            <h2 className="text-2xl font-bold mb-4">Em breve</h2>
            <p>Conteúdo da aba <strong>{activeTab}</strong> será implementado.</p>
          </div>
        );
      default:
        return <div className="p-6">Aba inválida.</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter bg-gradient-to-br from-blue-50 to-indigo-100">
      {message && (
        <MessageModal message={message} type={messageType} onClose={() => setMessage('')} />
      )}
      <TopNav onLogout={onLogout} />
      <main className="flex-1 max-w-[1500px] mx-auto w-full px-4 py-6 flex flex-col min-h-0">
        <div className="flex flex-1 min-h-0 bg-white rounded-xl shadow overflow-hidden">
          {/* Menu lateral */}
          <aside className="w-72 bg-blue-800 text-white p-6 flex-shrink-0 flex flex-col">
            <h2 className="text-xl font-bold mb-4">Painel do Estudante</h2>
            {[
              { id: 'anotacoes', label: 'Minhas Anotações', icon: ClipboardList },
              { id: 'curtidas', label: 'Minhas Curtidas', icon: ThumbsUp },
              { id: 'comentarios', label: 'Meus Comentários', icon: MessageSquare },
              { id: 'teoria', label: 'Teoria', icon: Book },
              { id: 'favoritas', label: 'Favoritas', icon: Star },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 rounded-lg mb-2 transition ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-800 font-bold ring-2 ring-blue-300'
                    : 'hover:bg-blue-700 text-blue-200'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Conteúdo */}
          <section className="flex-1 flex flex-col min-h-0 p-6 bg-white">
            {renderActiveTabContent()}
          </section>
        </div>
      </main>
      <footer className="bg-white text-center text-sm text-gray-500 py-4 shadow-inner border-t border-gray-100">
        © {new Date().getFullYear()} Questões da Aprovação. Todos os direitos reservados.
      </footer>
    </div>
  );
}













