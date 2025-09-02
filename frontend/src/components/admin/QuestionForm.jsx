import React, { useState, useEffect, useRef } from 'react';
import RichTextEditor from '../RichTextEditor'; // Importa o RichTextEditor
import { Loader2 } from 'lucide-react'; // Importa Loader2 para o botão de loading

// Importação da lista de matérias
import { allMaterias } from '../../data/materias/materias'; // Confirmado: exporta 'allMaterias'

// Importações dos assuntos específicos
import { assuntosDireitoAdministrativo } from '../../data/assuntos/Direito/DireitoAdministrativo';
import { assuntosDireitoCivil } from '../../data/assuntos/Direito/DireitoCivil';
import { assuntosDireitoPenal } from '../../data/assuntos/Direito/DireitoPenal';
import { assuntosDireitoConstitucional } from '../../data/assuntos/Direito/DireitoConstitucional';
import { assuntosDireitoProcessualCivil } from '../../data/assuntos/Direito/DireitoProcessualCivil';
import { assuntosDireitoProcessualPenal } from '../../data/assuntos/Direito/DireitoProcessualPenal';
import { assuntosDireitoPrevidenciario } from '../../data/assuntos/Direito/DireitoPrevidenciario'; // Importação correta

// Adicionar aqui outras importações de assuntos conforme necessário

// Importações das novas listas (Anos, Cargos, Bancas, Orgaos)
import { anos } from '../../data/anos/anos';
import { cargos } from '../../data/cargos/cargos';
import { bancas } from '../../data/bancas/bancas';
import { orgaos } from '../../data/orgaos/orgaos';
import { escolaridades } from '../../data/escolaridades/escolaridades'; // Assumindo 'escolaridades'
import { dificuldades } from '../../data/dificuldades/dificuldades'; // Assumindo 'dificuldades'
import { regioes } from '../../data/regioes/regioes'; // Assumindo 'regioes'


// Constante para mapear matérias aos seus assuntos
const assuntosPorMateria = {
    'Direito Administrativo': assuntosDireitoAdministrativo,
    'Direito Civil': assuntosDireitoCivil,
    'Direito Penal': assuntosDireitoPenal,
    'Direito Constitucional': assuntosDireitoConstitucional,
    // A chave abaixo deve ser EXATAMENTE igual à string da matéria em 'allMaterias'
    'Direito Processual Civil - Novo Código de Processo Civil - CPC 2015': assuntosDireitoProcessualCivil, 
    'Direito Processual Penal': assuntosDireitoProcessualPenal,
    'Direito Previdenciário': assuntosDireitoPrevidenciario, // CORRIGIDO: de 'assuntosDireitosPrevidenciario' para 'assuntosDireitoPrevidenciario'
    // Adicionar aqui outros mapeamentos de matéria para assunto
};

export default function QuestionForm({ token, onSuccess, question, isLoading, onCancel }) {
    // Inicializa estados com base na prop 'question' ou valores padrão
    const [enunciado, setEnunciado] = useState('');
    const [itemA, setItemA] = useState('');
    const [itemB, setItemB] = useState('');
    const [itemC, setItemC] = useState('');
    const [itemD, setItemD] = useState('');
    const [itemE, setItemE] = useState('');
    
    const [correta, setCorreta] = useState(0); // 0-4 para A-E, 0 para Errado, 1 para Certo
    const [tipo, setTipo] = useState('multipla');
    const [informacoes, setInformacoes] = useState('');
    const [gabarito, setGabarito] = useState(''); // Este estado será para o valor string do gabarito (A, B, C, D, E, Certo, Errado)
    const [comentarioProfessor, setComentarioProfessor] = useState('');

    const [materia, setMateria] = useState('');
    const [assunto, setAssunto] = useState('');
    const [banca, setBanca] = useState('');
    const [orgao, setOrgao] = useState('');
    const [cargo, setCargo] = useState('');
    const [ano, setAno] = useState('');
    const [escolaridade, setEscolaridade] = useState('');
    const [dificuldade, setDificuldade] = useState('');
    const [regiao, setRegiao] = useState('');

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [assuntosDinamicos, setAssuntosDinamicos] = useState([]); // Para o datalist de assunto

    // Carrega dados da questão para edição
    useEffect(() => {
        console.log('--- useEffect QuestionForm: question prop changed ---');
        console.log('Question prop recebida:', question);

        if (question) {
            setEnunciado(question.enunciado || '');
            setItemA(question.itemA || '');
            setItemB(question.itemB || '');
            setItemC(question.itemC || '');
            setItemD(question.itemD || '');
            setItemE(question.itemE || '');
            
            // Log dos itens após setar os estados
            console.log('Estados itemA, B, C, D, E após setar:', {
                itemA: question.itemA,
                itemB: question.itemB,
                itemC: question.itemC,
                itemD: question.itemD,
                itemE: question.itemE,
            });

            // Ajusta o gabarito para o formato correto (índice para múltipla, string para certo/errado)
            setTipo(question.tipo || 'multipla');
            setInformacoes(question.informacoes || '');
            setComentarioProfessor(question.comentarioProfessor || '');

            setMateria(question.materia || '');
            setAssunto(question.assunto || '');
            setBanca(question.banca || '');
            setOrgao(question.orgao || '');
            setCargo(question.cargo || '');
            setAno(String(question.ano || '') || ''); // Converte para string para o input
            setEscolaridade(question.escolaridade || '');
            setDificuldade(question.dificuldade || '');
            setRegiao(question.regiao || '');

            // Define o estado 'gabarito' e 'correta' com base no tipo da questão
            setGabarito(question.gabarito || ''); // Mantém o gabarito como string para o backend
            if (question.tipo === 'multipla') {
                const letras = ['A', 'B', 'C', 'D', 'E'];
                setCorreta(letras.indexOf((question.gabarito || '').toUpperCase()));
            } else if (question.tipo === 'certo_errado') {
                setCorreta(question.gabarito === 'Certo' ? 1 : 0);
            } else {
                setCorreta(0); // Padrão
            }

        } else {
            // Reseta os campos para nova questão
            console.log('Resetando estados do formulário (nova questão ou sem questão selecionada).');
            setEnunciado('');
            setItemA('');
            setItemB('');
            setItemC('');
            setItemD('');
            setItemE('');
            setCorreta(0);
            setTipo('multipla');
            setInformacoes('');
            setGabarito('');
            setComentarioProfessor('');
            setMateria('');
            setAssunto('');
            setBanca('');
            setOrgao('');
            setCargo('');
            setAno('');
            setEscolaridade('');
            setDificuldade('');
            setRegiao('');
        }
    }, [question]);

    // Efeito para filtrar assuntos com base na matéria selecionada
    useEffect(() => {
        if (materia && assuntosPorMateria[materia]) {
            setAssuntosDinamicos(assuntosPorMateria[materia]);
        } else {
            setAssuntosDinamicos([]);
        }
    }, [materia]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        // Converte o gabarito (correta) para o formato esperado pelo backend (string)
        let gabaritoParaBackend = '';
        if (tipo === 'multipla') {
            const letras = ['A', 'B', 'C', 'D', 'E'];
            gabaritoParaBackend = letras[correta];
        } else if (tipo === 'certo_errado') {
            gabaritoParaBackend = correta === 1 ? 'Certo' : 'Errado';
        }

        // Validação básica
        if (!enunciado || !materia || !assunto || !banca || !gabaritoParaBackend || !tipo) {
            setMessage('Por favor, preencha todos os campos obrigatórios (Enunciado, Matéria, Assunto, Banca, Gabarito, Tipo de Questão).');
            setMessageType('error');
            return;
        }

        const questionData = {
            id: question?.id, // Inclui o ID se estiver editando
            enunciado,
            itemA, // Passa itemA, itemB, etc. diretamente
            itemB,
            itemC,
            itemD,
            itemE,
            materia,
            assunto,
            banca,
            orgao,
            cargo,
            ano: ano ? parseInt(ano, 10) : null, // Garante que ano é número ou null
            escolaridade,
            dificuldade,
            regiao,
            gabarito: gabaritoParaBackend, // Usa o gabarito convertido para backend
            informacoes,
            comentarioProfessor,
            tipo,
        };
        onSuccess(questionData);
    };

    // Nova função para lidar com a mudança do tipo de questão
    const handleTipoChange = (e) => {
        const newTipo = e.target.value;
        setTipo(newTipo);
        setGabarito(''); // Limpa o gabarito ao mudar o tipo (string)
        setCorreta(0); // Reseta a correta também (índice/bool)

        if (newTipo === 'certo_errado') {
            // Limpa os itens de múltipla escolha para evitar envio de dados desnecessários
            setItemA('');
            setItemB('');
            setItemC('');
            setItemD('');
            setItemE('');
        }
    };

    // Array de itens para renderização dinâmica
    const itemsMultiplaEscolha = [
        { label: 'Item A', value: itemA, setter: setItemA },
        { label: 'Item B', value: itemB, setter: setItemB },
        { label: 'Item C', value: itemC, setter: setItemC },
        { label: 'Item D', value: itemD, setter: setItemD },
        { label: 'Item E', value: itemE, setter: setItemE },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`p-3 mb-4 rounded text-center ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            {/* Comentário do Professor */}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Comentário do Professor:
                </label>
                <RichTextEditor 
                    key={question?.id ? `comentario-professor-${question.id}` : `new-comentario-professor`} // Adicionado key
                    value={comentarioProfessor} 
                    onChange={setComentarioProfessor} 
                />
            </div>

            {/* Tipo de Questão */}
            <div className="mb-4">
                <label htmlFor="tipo" className="block text-gray-700 text-sm font-bold mb-2">
                    Tipo de Questão: <span className="text-red-500">*</span>
                </label>
                <select
                    id="tipo"
                    value={tipo}
                    onChange={handleTipoChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                >
                    <option value="multipla">Múltipla Escolha</option>
                    <option value="certo_errado">Certo ou Errado</option>
                </select>
            </div>

            {/* Informações Adicionais */}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Informações Adicionais:
                </label>
                <RichTextEditor 
                    key={question?.id ? `informacoes-${question.id}` : `new-informacoes`} // Adicionado key
                    value={informacoes} 
                    onChange={setInformacoes} 
                />
            </div>

            {/* Enunciado */}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Enunciado:</label>
                <RichTextEditor 
                    key={question?.id ? `enunciado-${question.id}` : `new-enunciado`} // Adicionado key
                    value={enunciado} 
                    onChange={setEnunciado} 
                />
            </div>

            {/* Alternativas (Condicional) */}
            {tipo === 'multipla' && (
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Alternativas:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {itemsMultiplaEscolha.map((item, index) => (
                            <div key={index} className="flex flex-col"> {/* Removido flex items-center para alinhar label em cima */}
                                <label htmlFor={`item${String.fromCharCode(65 + index)}`} className="block text-gray-700 font-semibold mb-1">{item.label}:</label>
                                <RichTextEditor 
                                    key={question?.id ? `item-${question.id}-${index}` : `new-item-${index}`} // Adicionado key
                                    value={item.value} 
                                    onChange={item.setter} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Gabarito para Múltipla Escolha (Campo Separado) */}
            {tipo === 'multipla' && (
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Gabarito (Múltipla Escolha): <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="gabarito-multipla"
                        value={correta} // Usa o índice numérico
                        onChange={(e) => setCorreta(parseInt(e.target.value))}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value={-1}>Selecione o Gabarito</option> {/* Opção para "selecione" */}
                        <option value={0}>A</option>
                        <option value={1}>B</option>
                        <option value={2}>C</option>
                        <option value={3}>D</option>
                        <option value={4}>E</option>
                    </select>
                </div>
            )}

            {/* Gabarito para Certo/Errado (Campo Separado) */}
            {tipo === 'certo_errado' && (
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Gabarito (Certo ou Errado): <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="gabarito-ce"
                        value={correta} // Usa 'correta' para gerenciar Certo/Errado (0 para Errado, 1 para Certo)
                        onChange={(e) => setCorreta(parseInt(e.target.value))}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value={-1}>Selecione</option> {/* Opção para "selecione" */}
                        <option value={0}>Errado</option>
                        <option value={1}>Certo</option>
                    </select>
                </div>
            )}

            {/* Campos de Filtro com Datalist (sugestões nativas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Matéria */}
                <div className="relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Matéria:
                    </label>
                    <input
                        type="text"
                        value={materia}
                        onChange={(e) => {
                            setMateria(e.target.value);
                            setAssunto(''); // Limpa o assunto ao mudar a matéria
                        }}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        list="materias-list"
                    />
                    <datalist id="materias-list">
                        {[...new Set(allMaterias)].map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </div>

                {/* Assunto */}
                <div className="relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Assunto:
                    </label>
                    <input
                        type="text"
                        value={assunto}
                        onChange={(e) => setAssunto(e.target.value)}
                        disabled={!materia}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        list="assuntos-list"
                    />
                    <datalist id="assuntos-list">
                        {[...new Set(assuntosDinamicos)].map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </div>

                {/* Banca */}
                <div className="relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Banca:
                    </label>
                    <input
                        type="text"
                        value={banca}
                        onChange={(e) => setBanca(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        list="bancas-list"
                    />
                    <datalist id="bancas-list">
                        {[...new Set(bancas)].map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </div>

                {/* Órgão */}
                <div className="relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Órgão:
                    </label>
                    <input
                        type="text"
                        value={orgao}
                        onChange={(e) => setOrgao(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        list="orgaos-list"
                    />
                    <datalist id="orgaos-list">
                        {[...new Set(orgaos)].map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </div>

                {/* Cargo */}
                <div className="relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Cargo:
                    </label>
                    <input
                        type="text"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        list="cargos-list"
                    />
                    <datalist id="cargos-list">
                        {[...new Set(cargos)].map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </div>

                {/* Ano */}
                <div className="relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Ano:
                    </label>
                    <input
                        type="text" // Mantido como text para compatibilidade com datalist
                        value={ano}
                        onChange={(e) => setAno(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        list="anos-list"
                    />
                    <datalist id="anos-list">
                        {[...new Set(anos)].map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </div>

                {/* Escolaridade */}
                <div className="relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Escolaridade:
                    </label>
                    <input
                        type="text"
                        value={escolaridade}
                        onChange={(e) => setEscolaridade(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        list="escolaridades-list"
                    />
                    <datalist id="escolaridades-list">
                        {[...new Set(escolaridades)].map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </div>

                {/* Dificuldade */}
                <div className="relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Dificuldade:
                    </label>
                    <input
                        type="text"
                        value={dificuldade}
                        onChange={(e) => setDificuldade(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        list="dificuldades-list"
                    />
                    <datalist id="dificuldades-list">
                        {[...new Set(dificuldades)].map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </div>

                {/* Região */}
                <div className="relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Região:
                    </label>
                    <input
                        type="text"
                        value={regiao}
                        onChange={(e) => setRegiao(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        list="regioes-list"
                    />
                    <datalist id="regioes-list">
                        {[...new Set(regioes)].map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </div>
            </div>

            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : (question ? 'Atualizar Questão' : 'Criar Questão')}\
            </button>
            {question && ( // Mostra o botão de cancelar apenas se estiver editando
                <button
                    type="button"
                    onClick={onCancel} // Chama a prop onCancel
                    className="ml-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
                    disabled={isLoading}
                >
                    Cancelar Edição
                </button>
            )}
        </form>
    );
}






























