// src/components/admin/TheoryForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import RichTextEditor from '../RichTextEditor';
import MessageModal from '../ui/MessageModal'; // Importa o MessageModal

// Importa todos os arquivos de assuntos de Direito
import { assuntosDireitoAdministrativo } from '../../data/assuntos/Direito/DireitoAdministrativo';
import { assuntosDireitoCivil } from '../../data/assuntos/Direito/DireitoCivil';
import { assuntosDireitoConstitucional } from '../../data/assuntos/Direito/DireitoConstitucional';
import { assuntosDireitoPenal } from '../../data/assuntos/Direito/DireitoPenal';
// Adicione outras importações de assuntos conforme necessário para outras matérias

// Mapeamento de matérias para seus respectivos arrays de assuntos
const assuntosPorMateria = {
  'Direito Administrativo': assuntosDireitoAdministrativo,
  'Direito Civil': assuntosDireitoCivil,
  'Direito Constitucional': assuntosDireitoConstitucional,
  'Direito Penal': assuntosDireitoPenal,
  // Adicione outros mapeamentos conforme necessário (ex: 'Matemática': assuntosMatematica)
};

// Recebe materiasDisponiveis como prop, que agora é a lista de strings de matérias
export default function TheoryForm({ token, onSuccess, theory, isLoading, onCancel, materiasDisponiveis }) {
  const [materia, setMateria] = useState('');
  const [assunto, setAssunto] = useState('');
  const [conteudo, setConteudo] = useState('');

  const [filteredMaterias, setFilteredMaterias] = useState([]);
  const [showMateriasSuggestions, setShowMateriasSuggestions] = useState(false);

  const [filteredAssuntos, setFilteredAssuntos] = useState([]);
  const [showAssuntosSuggestions, setShowAssuntosSuggestions] = useState(false);
  const [assuntosDinamicos, setAssuntosDinamicos] = useState([]); // Assuntos da matéria selecionada

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  // Efeito para preencher o formulário se estiver editando uma teoria existente
  useEffect(() => {
    if (theory) {
      setMateria(theory.materia || '');
      setAssunto(theory.assunto || '');
      setConteudo(theory.content || ''); // 'content' em vez de 'conteudo' para corresponder ao schema
    } else {
      // Limpa os campos quando não há teoria para edição (modo de criação)
      setMateria('');
      setAssunto('');
      setConteudo('');
    }
  }, [theory]);

  // Efeito para atualizar os assuntos dinâmicos quando a matéria muda
  useEffect(() => {
    // Busca os assuntos correspondentes à matéria selecionada no mapeamento local
    const assuntosDaMateria = assuntosPorMateria[materia] || [];
    setAssuntosDinamicos(assuntosDaMateria);
    // Se o assunto atual não estiver na nova lista de assuntos, limpa-o
    // Isso é importante para evitar que um assunto de uma matéria anterior permaneça selecionado
    if (assunto && !assuntosDaMateria.includes(assunto)) {
        setAssunto('');
    }
  }, [materia, assunto]); // Adicionado 'assunto' como dependência para reavaliar a limpeza

  // Efeito para carregar o conteúdo da teoria quando matéria e assunto são selecionados
  // Este useEffect só deve ser ativado se NÃO estivermos no modo de edição (theory é null)
  // ou se a teoria em edição for diferente da que está sendo buscada.
  useEffect(() => {
    const fetchTheoryContent = async () => {
      // Só busca se não estivermos editando uma teoria já carregada
      if (materia && assunto && (!theory || (theory.materia !== materia || theory.assunto !== assunto))) {
        try {
          // CONSTRUÇÃO DA URL COM PARÂMETROS DE CONSULTA
          const params = new URLSearchParams();
          params.append('materia', materia);
          params.append('assunto', assunto);
            
          // NOVA URL AQUI!
          const response = await fetch(`${API_URL}/api/theories/content/?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setConteudo(data.content || ''); // Define o conteúdo da teoria existente
          } else if (response.status === 404) {
            setConteudo(''); // Limpa o conteúdo se a teoria não for encontrada
          } else {
            const errorData = await response.json();
            setMessage(errorData.detail || 'Erro ao carregar teoria existente.');
            setMessageType('error');
            setConteudo('');
          }
        } catch (error) {
          console.error('Erro ao buscar teoria existente:', error);
          setMessage('Erro de rede ao carregar teoria existente.');
          setMessageType('error');
          setConteudo('');
        }
      } else if (!materia || !assunto) {
        setConteudo(''); // Limpa o conteúdo se matéria ou assunto não estiverem selecionados
      }
    };

    fetchTheoryContent();
  }, [materia, assunto, token, API_URL, theory]);


  const handleFilterChange = (setter, allSuggestions, filterSetter, showSetter) => (e) => {
    const value = e.target.value;
    setter(value);
    if (value.length > 0) {
      const filtered = allSuggestions.filter(s => 
        s.toLowerCase().includes(value.toLowerCase())
      );
      filterSetter(filtered);
      showSetter(true);
    } else {
      showSetter(false);
      filterSetter([]);
    }
  };

  const handleSuggestionClick = (suggestion, setter, showSetter) => {
    setter(suggestion);
    showSetter(false);
  };

  const handleFocus = (allSuggestions, filterSetter, showSetter, currentValue) => () => {
    const filtered = currentValue
      ? allSuggestions.filter(s => s.toLowerCase().includes(currentValue.toLowerCase()))
      : allSuggestions;
    filterSetter(filtered);
    showSetter(true);
  };

  const handleBlur = (showSetter) => () => {
    setTimeout(() => showSetter(false), 100);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // CORREÇÃO: A variável `content` não existe. Deve ser `conteudo`.
  if (!materia || !assunto || !conteudo) { 
    setMessage('Por favor, preencha todos os campos obrigatórios.');
    setMessageType('error');
    return;
  }

  try {
    // Este fetch está correto, pois o endpoint /api/theories/ (POST)
    // espera materia, assunto e content no corpo da requisição.
    const response = await fetch(`${API_URL}/api/theories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        materia,
        assunto,
        content: conteudo, // Use 'conteudo' aqui
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro ao salvar a teoria.');
    }

    setMessage('Teoria salva com sucesso!');
    setMessageType('success');
    if (onSuccess) onSuccess(); // chama callback para atualizar lista se necessário
  } catch (error) {
    setMessage('Erro ao salvar teoria: ' + error.message);
    setMessageType('error');
  }
};


  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full">
      <h1 className="text-xl font-bold mb-4 text-center">{theory ? 'Atualizar Teoria' : 'Criar Nova Teoria'}</h1>

      {message && (
        <MessageModal
            message={message}
            type={messageType}
            onClose={() => setMessage('')}
        />
      )}

      {/* Matéria */}
      <div className="mb-4 relative">
        <label className="block text-gray-700 text-sm font-bold mb-2">Matéria:</label>
        <input
          type="text"
          value={materia}
          onChange={(e) => {
            handleFilterChange(setMateria, materiasDisponiveis, setFilteredMaterias, setShowMateriasSuggestions)(e);
            setAssunto(''); // Reseta o assunto ao mudar a matéria
          }}
          onFocus={handleFocus(materiasDisponiveis, setFilteredMaterias, setShowMateriasSuggestions, materia)}
          onBlur={handleBlur(setShowMateriasSuggestions)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        {showMateriasSuggestions && filteredMaterias.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-lg max-h-48 overflow-y-auto">
            {filteredMaterias.map((s) => (
              <li
                key={s}
                onClick={() => {
                  handleSuggestionClick(s, setMateria, setShowMateriasSuggestions);
                  setAssunto(''); // Reseta o assunto ao selecionar a matéria
                }}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assunto (aparece somente após selecionar matéria) */}
      {materia && (
        <div className="mb-4 relative">
          <label className="block text-gray-700 text-sm font-bold mb-2">Assunto:</label>
          <input
            type="text"
            value={assunto}
            onChange={handleFilterChange(setAssunto, assuntosDinamicos, setFilteredAssuntos, setShowAssuntosSuggestions)}
            onFocus={handleFocus(assuntosDinamicos, setFilteredAssuntos, setShowAssuntosSuggestions, assunto)}
            onBlur={handleBlur(setShowAssuntosSuggestions)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {showAssuntosSuggestions && filteredAssuntos.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-lg max-h-48 overflow-y-auto">
              {filteredAssuntos.map((s) => (
                <li
                  key={s}
                  onClick={() => handleSuggestionClick(s, setAssunto, setShowAssuntosSuggestions)}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Conteúdo */}
      {materia && assunto && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Conteúdo:</label>
          <RichTextEditor value={conteudo} onChange={setConteudo} />
        </div>
      )}

      {/* Botões */}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
      >
        {isLoading ? 'Salvando...' : (theory ? 'Atualizar Teoria' : 'Criar Teoria')}
      </button>
      {theory && ( // Só mostra o botão de cancelar se estiver em modo de edição
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="ml-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Cancelar Edição
        </button>
      )}
    </form>
  );
}
























