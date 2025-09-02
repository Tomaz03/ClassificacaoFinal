    import React, { useState, useEffect, useCallback } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
    import { LogOut, Users, BookOpen, FileText, UploadCloud, Edit, Trash2, Loader2, XCircle, CheckCircle, CircleDotDashed } from 'lucide-react';
    import QuestionForm from './QuestionForm';
    import RichTextEditor from '../RichTextEditor';
    import MessageModal from '../ui/MessageModal';
    import ActionModal from '../ui/ActionModal';
    import { motion } from 'framer-motion';
    import TheoryForm from './TheoryForm';

    import { allMaterias } from '../../data/materias/materias';

    // Funções de mapeamento (manter as existentes)
    const mapBackendToFrontend = (backendData) => {
        const safeString = (value) => value === null || value === undefined ? '' : value;
        const getCorrectIndex = (gabarito, tipo, alternativasArray) => {
            if (tipo === 'multipla' && gabarito) {
                const letras = ['A', 'B', 'C', 'D', 'E'];
                return letras.indexOf(gabarito.toUpperCase());
            }
            if (tipo === 'certo_errado' && gabarito) {
                return gabarito.toLowerCase() === 'certo' ? 1 : 0;
            }
            return null;
        };

        const frontendData = {
            id: backendData.id,
            enunciado: safeString(backendData.enunciado),
            itemA: safeString(backendData.item_a),
            itemB: safeString(backendData.item_b),
            itemC: safeString(backendData.item_c),
            itemD: safeString(backendData.item_d),
            itemE: safeString(backendData.item_e),
            materia: safeString(backendData.materia),
            assunto: safeString(backendData.assunto),
            banca: safeString(backendData.banca),
            orgao: safeString(backendData.orgao),
            cargo: safeString(backendData.cargo),
            ano: backendData.ano || '',
            escolaridade: safeString(backendData.escolaridade),
            dificuldade: safeString(backendData.dificuldade),
            regiao: safeString(backendData.regiao),
            gabarito: safeString(backendData.gabarito),
            informacoes: safeString(backendData.informacoes),
            comentarioProfessor: safeString(backendData.comentarioProfessor || backendData.comentario_professor),
            tipo: safeString(backendData.tipo),
            isAnulada: backendData.is_anulada || false,
            isDesatualizada: backendData.is_desatualizada || false,
        };

        if (frontendData.tipo === 'multipla') {
            frontendData.alternativas = [
                frontendData.itemA,
                frontendData.itemB,
                frontendData.itemC,
                frontendData.itemD,
                frontendData.itemE
            ];
        } else if (frontendData.tipo === 'certo_errado') {
            frontendData.alternativas = ['Certo', 'Errado'];
        } else {
            frontendData.alternativas = [];
        }

        frontendData.correta = getCorrectIndex(frontendData.gabarito, frontendData.tipo, frontendData.alternativas);
        return frontendData;
    };

    const mapFrontendToBackend = (frontendData) => {
        const safeString = (value) => value === null || value === undefined ? '' : value;

        return {
            enunciado: safeString(frontendData.enunciado),
            item_a: safeString(frontendData.itemA),
            item_b: safeString(frontendData.itemB),
            item_c: safeString(frontendData.itemC),
            item_d: safeString(frontendData.itemD),
            item_e: safeString(frontendData.itemE),
            materia: safeString(frontendData.materia),
            assunto: safeString(frontendData.assunto),
            banca: safeString(frontendData.banca),
            orgao: safeString(frontendData.orgao),
            cargo: safeString(frontendData.cargo),
            ano: frontendData.ano ? parseInt(frontendData.ano, 10) : null,
            escolaridade: safeString(frontendData.escolaridade),
            dificuldade: safeString(frontendData.dificuldade),
            regiao: safeString(frontendData.regiao),
            gabarito: safeString(frontendData.gabarito),
            informacoes: safeString(frontendData.informacoes),
            comentarioProfessor: safeString(frontendData.comentarioProfessor),
            tipo: safeString(frontendData.tipo),
            is_anulada: frontendData.isAnulada,
            is_desatualizada: frontendData.isDesatualizada,
        };
    };


    export default function AdminDashboard({ token, onLogout }) {
        const navigate = useNavigate();
        const [activeTab, setActiveTab] = useState('gerenciar-questoes');
        const [statusMessage, setStatusMessage] = useState('');
        const [statusType, setStatusType] = useState('');

        // Estados para Gerenciamento de Usuários Pendentes
        const [pendingUsers, setPendingUsers] = useState([]);

        // Estados para Gerenciamento de Questões
        const [questions, setQuestions] = useState([]);
        const [searchTerm, setSearchTerm] = useState('');
        const [currentPage, setCurrentPage] = useState(1);
        const QUESTIONS_PER_PAGE = 50;
        const filteredQuestions = questions.filter((q) => {
            const search = searchTerm.toLowerCase();
            return (
                q.id.toString().includes(search) ||
                (q.enunciado && q.enunciado.toLowerCase().includes(search))
            );
        });

        const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);

        const paginatedQuestions = filteredQuestions.slice(
            (currentPage - 1) * QUESTIONS_PER_PAGE,
            currentPage * QUESTIONS_PER_PAGE
        );
        const [editingQuestion, setEditingQuestion] = useState(null);
        const [isQuestionLoading, setIsQuestionLoading] = useState(false);
        const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
        const [questionToDelete, setQuestionToDelete] = useState(null);

        // Estados para Gerenciamento de Teoria
        const [materiasDisponiveis, setMateriasDisponiveis] = useState([]); 
        const [theories, setTheories] = useState([]);
        const [editingTheory, setEditingTheory] = useState(null);
        const [isTheoryLoading, setIsTheoryLoading] = useState(false);
        const [theoryStatusMessage, setTheoryStatusMessage] = useState('');
        const [theoryStatusType, setTheoryStatusType] = useState('');

        // Modal de confirmação de exclusão de teoria
        const [showDeleteTheoryConfirmModal, setShowDeleteTheoryConfirmModal] = useState(false);
        const [theoryToDelete, setTheoryToDelete] = useState(null);

        // Estados para Upload de PDF
        const [file, setFile] = useState(null);
        const [isPdfUploadLoading, setIsPdfUploadLoading] = useState(false);
        const [pdfUploadMessage, setPdfUploadMessage] = useState('');
        const [pdfUploadMessageType, setPdfUploadMessageType] = useState('');

        // NOVOS ESTADOS para Gerenciar Status de Questões
        const [questionIdToUpdateStatus, setQuestionIdToUpdateStatus] = useState('');
        const [isAnulada, setIsAnulada] = useState(false);
        const [isDesatualizada, setIsDesatualizada] = useState(false);
        const [isStatusLoading, setIsStatusLoading] = useState(false);
        const [statusQuestionMessage, setStatusQuestionMessage] = useState('');
        const [statusQuestionType, setStatusQuestionType] = useState('');


        const API_URL = import.meta.env.VITE_API_URL;

        // === FUNÇÕES DE LÓGICA E BUSCA DE DADOS ===

        // Funções para Usuários Pendentes
        const fetchPendingUsers = useCallback(async () => {
            console.log("AdminDashboard: fetchPendingUsers - Iniciando busca de usuários pendentes..."); // LOG
            try {
                const response = await fetch(`${API_URL}/api/users/pending`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('AdminDashboard: fetchPendingUsers - Response status:', response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error('AdminDashboard: fetchPendingUsers - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login')); // Chamar onLogout para limpar o token
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Falha ao buscar usuários pendentes');
                }
                const data = await response.json();
                console.log('AdminDashboard: fetchPendingUsers - Dados recebidos:', data); // LOG
                if (Array.isArray(data)) setPendingUsers(data);
            } catch (error) {
                console.error('AdminDashboard: fetchPendingUsers - Erro ao buscar usuários pendentes:', error); // LOG
                setStatusMessage('Erro ao carregar usuários pendentes: ' + error.message);
                setStatusType('error');
                setTimeout(() => setStatusMessage(''), 3000);
            }
        }, [API_URL, token, onLogout, navigate]);

        const handleUserAction = async (userId, action) => {
            console.log(`AdminDashboard: handleUserAction - Tentando ${action} usuário ID: ${userId}`); // LOG
            try {
                const response = await fetch(`${API_URL}/api/users/${userId}/${action}`, {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(`AdminDashboard: handleUserAction - Response status para ${action}:`, response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error(`AdminDashboard: handleUserAction - Não autorizado ou proibido para ${action}. Redirecionando...`); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Falha ao ${action} usuário`);
                }
                await fetchPendingUsers();
                setStatusMessage(`Usuário ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso!`);
                setStatusType('success');
            } catch (error) {
                console.error(`AdminDashboard: handleUserAction - Erro ao ${action} usuário:`, error); // LOG
                setStatusMessage(`Erro ao ${action} usuário: ` + error.message);
                setStatusType('error');
            } finally {
                setTimeout(() => setStatusMessage(''), 3000);
            }
        };

        // Funções para Gerenciamento de Questões (manter as existentes)
        const fetchQuestions = useCallback(async () => {
            setIsQuestionLoading(true);
            console.log("AdminDashboard: fetchQuestions - Iniciando busca de questões..."); // LOG
            try {
                const res = await fetch(`${API_URL}/api/questions/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('AdminDashboard: fetchQuestions - Response status:', res.status); // LOG
                if (res.status === 401 || res.status === 403) {
                    console.error('AdminDashboard: fetchQuestions - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Falha ao buscar questões');
                }
                const data = await res.json();
                console.log('AdminDashboard: fetchQuestions - Dados recebidos:', data); // LOG
                if (Array.isArray(data)) setQuestions(data.map(mapBackendToFrontend));
                else {
                    console.error('AdminDashboard: Dados de questões não são um array:', data); // LOG
                    setQuestions([]);
                }
            } catch (err) {
                console.error('AdminDashboard: fetchQuestions - Erro geral na função fetchQuestions:', err); // LOG
                setStatusMessage('Erro ao carregar questões: ' + err.message);
                setStatusType('error');
                setTimeout(() => setStatusMessage(''), 3000);
            } finally {
                setIsQuestionLoading(false);
            }
        }, [API_URL, token, onLogout, navigate]);

        const handleQuestionFormSubmit = async (questionPayload) => {
            setIsQuestionLoading(true);
            setStatusMessage('');
            setStatusType('');
            console.log("AdminDashboard: handleQuestionFormSubmit - Enviando payload:", questionPayload); // LOG

            try {
                let response;
                const backendPayload = mapFrontendToBackend(questionPayload);
                console.log("AdminDashboard: handleQuestionFormSubmit - Payload para backend:", backendPayload); // LOG

                if (questionPayload && questionPayload.id) {
                    response = await fetch(`${API_URL}/api/questions/${questionPayload.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(backendPayload),
                    });
                } else {
                    response = await fetch(`${API_URL}/api/questions/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(backendPayload),
                    });
                }

                console.log('AdminDashboard: handleQuestionFormSubmit - Response status:', response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error('AdminDashboard: handleQuestionFormSubmit - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Falha ao salvar a questão.');
                }

                setStatusMessage(`Questão ${questionPayload.id ? 'atualizada' : 'adicionada'} com sucesso!`);
                setStatusType('success');
                setEditingQuestion(null);
                fetchQuestions();
            }
            catch (error) {
                console.error('AdminDashboard: handleQuestionFormSubmit - Erro ao salvar questão:', error); // LOG
                setStatusMessage('Erro ao salvar questão: ' + error.message);
                setStatusType('error');
            } finally {
                setIsQuestionLoading(false);
                setTimeout(() => setStatusMessage(''), 3000);
            }
        };

        const handleEditQuestion = useCallback((question) => {
            console.log('AdminDashboard: handleEditQuestion chamado com (já em formato frontend):', question); // LOG
            setEditingQuestion(question);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, []);

        const handleDeleteQuestionClick = (questionId) => {
            console.log('AdminDashboard: handleDeleteQuestionClick - Questão a ser deletada ID:', questionId); // LOG
            setQuestionToDelete(questionId);
            setShowDeleteConfirmModal(true);
        };

        const confirmDeleteQuestion = async () => {
            setIsQuestionLoading(true);
            setStatusMessage('');
            setStatusType('');
            setShowDeleteConfirmModal(false);
            console.log('AdminDashboard: confirmDeleteQuestion - Confirmando exclusão de questão ID:', questionToDelete); // LOG

            try {
                const response = await fetch(`${API_URL}/api/questions/${questionToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log('AdminDashboard: confirmDeleteQuestion - Response status:', response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error('AdminDashboard: confirmDeleteQuestion - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Falha ao deletar a questão.');
                }

                setStatusMessage('Questão deletada com sucesso!');
                setStatusType('success');
                fetchQuestions();
            } catch (error) {
                console.error('AdminDashboard: confirmDeleteQuestion - Erro ao deletar questão:', error); // LOG
                setStatusMessage('Erro ao deletar questão: ' + error.message);
                setStatusType('error');
            } finally {
                setIsQuestionLoading(false);
                setQuestionToDelete(null);
                setTimeout(() => setStatusMessage(''), 3000);
            }
        };

        const handleCancelEditQuestion = () => {
            console.log('AdminDashboard: handleCancelEditQuestion - Cancelando edição.'); // LOG
            setEditingQuestion(null);
        };

        // Funções para Gerenciamento de Teoria (manter as existentes)
        useEffect(() => {
            setMateriasDisponiveis(allMaterias);
        }, []);

        const fetchTheories = useCallback(async () => {
            setIsTheoryLoading(true);
            console.log("AdminDashboard: fetchTheories - Iniciando busca de teorias..."); // LOG
            try {
                const response = await fetch(`${API_URL}/api/theories/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('AdminDashboard: fetchTheories - Response status:', response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error('AdminDashboard: fetchTheories - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!response.ok) {
                    throw new Error('Falha ao buscar teorias existentes.');
                }
                const data = await response.json();
                console.log('AdminDashboard: fetchTheories - Dados recebidos:', data); // LOG
                const flattenedTheories = [];
                data.forEach(materiaData => {
                    materiaData.assuntos.forEach(assunto => {
                        flattenedTheories.push({ materia: materiaData.materia, assunto: assunto });
                    });
                });
                setTheories(flattenedTheories);
            } catch (error) {
                console.error('AdminDashboard: fetchTheories - Erro ao buscar teorias:', error); // LOG
                setTheoryStatusMessage('Erro ao carregar teorias: ' + error.message);
                setTheoryStatusType('error');
            } finally {
                setIsTheoryLoading(false);
            }
        }, [API_URL, token, onLogout, navigate]);

        const fetchMateriasEAssuntos = useCallback(async () => {
            console.log("AdminDashboard: fetchMateriasEAssuntos - Iniciando busca de metadados de teoria..."); // LOG
            try {
                const response = await fetch(`${API_URL}/api/theories/`, { // Endpoint para metadados de teoria
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('AdminDashboard: fetchMateriasEAssuntos - Response status:', response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error('AdminDashboard: fetchMateriasEAssuntos - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Falha ao buscar metadados de teoria');
                }
                const data = await response.json();
                console.log('AdminDashboard: fetchMateriasEAssuntos - Dados recebidos:', data); // LOG
                setMateriasDisponiveis(data);
            } catch (error) {
                console.error('AdminDashboard: fetchMateriasEAssuntos - Erro ao buscar matérias e assuntos para teoria:', error); // LOG
                setMateriasDisponiveis([]);
            }
        }, [API_URL, token, onLogout, navigate]);

        const handleSaveTheoryForm = async (payload) => {
            setIsTheoryLoading(true);
            setTheoryStatusMessage('');
            setTheoryStatusType('');
            console.log("AdminDashboard: handleSaveTheoryForm - Enviando payload:", payload); // LOG

            try {
                const response = await fetch(`${API_URL}/api/theories/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                console.log('AdminDashboard: handleSaveTheoryForm - Response status:', response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error('AdminDashboard: handleSaveTheoryForm - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Falha ao salvar a teoria.');
                }

                setTheoryStatusMessage('Teoria salva com sucesso!');
                setTheoryStatusType('success');
                setEditingTheory(null);
                fetchTheories();
            } catch (error) {
                console.error('AdminDashboard: handleSaveTheoryForm - Erro ao salvar teoria:', error); // LOG
                setTheoryStatusMessage('Erro ao salvar teoria: ' + error.message);
                setTheoryStatusType('error'); 
            } finally {
                setIsTheoryLoading(false);
                setTimeout(() => setTheoryStatusMessage(''), 3000);
            }
        };

        const handleEditTheory = useCallback(async (materia, assunto) => {
            setIsTheoryLoading(true);
            setTheoryStatusMessage('');
            setTheoryStatusType('');
            console.log(`AdminDashboard: handleEditTheory - Editando teoria: ${materia} - ${assunto}`); // LOG
            try {
                const params = new URLSearchParams();
                params.append('materia', materia);
                params.append('assunto', assunto);

                const response = await fetch(`${API_URL}/api/theories/content/?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('AdminDashboard: handleEditTheory - Response status:', response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error('AdminDashboard: handleEditTheory - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Falha ao carregar teoria para edição.');
                }
                const data = await response.json();
                console.log('AdminDashboard: handleEditTheory - Dados recebidos para edição:', data); // LOG
                setEditingTheory(data);
                setTheoryStatusMessage(`Editando teoria: ${materia} - ${assunto}`);
                setTheoryStatusType('info');
            } catch (error) {
                console.error('AdminDashboard: handleEditTheory - Erro ao carregar teoria para edição:', error); // LOG
                setTheoryStatusMessage('Erro ao carregar teoria para edição: ' + error.message);
                setTheoryStatusType('error');
            } finally {
                setIsTheoryLoading(false);
                setTimeout(() => setTheoryStatusMessage(''), 3000);
            }
        }, [API_URL, token, onLogout, navigate]);

        const handleCancelEditTheory = () => {
            console.log('AdminDashboard: handleCancelEditTheory - Cancelando edição de teoria.'); // LOG
            setEditingTheory(null);
            setTheoryStatusMessage('');
            setTheoryStatusType('');
        };

        const handleDeleteTheoryClick = (materia, assunto) => {
            console.log(`AdminDashboard: handleDeleteTheoryClick - Teoria a ser deletada: ${materia} - ${assunto}`); // LOG
            setTheoryToDelete({ materia, assunto });
            setShowDeleteTheoryConfirmModal(true);
        };

        const confirmDeleteTheory = async () => {
            if (!theoryToDelete) return;

            setIsTheoryLoading(true);
            setTheoryStatusMessage('');
            setTheoryStatusType('');
            setShowDeleteTheoryConfirmModal(false);
            console.log(`AdminDashboard: confirmDeleteTheory - Confirmando exclusão de teoria: ${theoryToDelete.materia} - ${theoryToDelete.assunto}`); // LOG

            try {
                const response = await fetch(`${API_URL}/api/theories/${encodeURIComponent(theoryToDelete.materia)}/${encodeURIComponent(theoryToDelete.assunto)}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log('AdminDashboard: confirmDeleteTheory - Response status:', response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error('AdminDashboard: confirmDeleteTheory - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Falha ao deletar a teoria.');
                }

                setTheoryStatusMessage('Teoria deletada com sucesso!');
                setTheoryStatusType('success');
                fetchTheories();
            } catch (error) {
                console.error('AdminDashboard: confirmDeleteTheory - Erro ao deletar teoria:', error); // LOG
                setTheoryStatusMessage('Erro ao deletar teoria: ' + error.message);
                setTheoryStatusType('error');
            } finally {
                setIsTheoryLoading(false);
                setTheoryToDelete(null);
                setTimeout(() => setTheoryStatusMessage(''), 3000);
            }
        };


        // Funções para Upload de PDF (manter as existentes)
        const handlePdfFileChange = (e) => {
            setFile(e.target.files[0]);
            console.log('AdminDashboard: handlePdfFileChange - Arquivo selecionado:', e.target.files[0]?.name); // LOG
        };

        const handlePdfUpload = async (e) => {
            e.preventDefault();
            if (!file) {
                setPdfUploadMessage('Por favor, selecione um arquivo PDF.');
                setPdfUploadMessageType('error');
                return;
            }

            setIsPdfUploadLoading(true);
            setPdfUploadMessage('');
            setPdfUploadMessageType('');
            console.log('AdminDashboard: handlePdfUpload - Iniciando upload de PDF:', file.name); // LOG

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`${API_URL}/api/upload-pdf/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });

                console.log('AdminDashboard: handlePdfUpload - Response status:', response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error('AdminDashboard: handlePdfUpload - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Falha ao processar o PDF.');
                }

                setPdfUploadMessage('PDF enviado e processado com sucesso! Questões adicionadas.');
                setPdfUploadMessageType('success');
                setFile(null);
                fetchQuestions();
            } catch (error) {
                console.error('AdminDashboard: handlePdfUpload - Erro no upload de PDF:', error); // LOG
                setPdfUploadMessage('Erro no upload de PDF: ' + error.message);
                setPdfUploadMessageType('error');
            } finally {
                setIsPdfUploadLoading(false);
                setTimeout(() => setPdfUploadMessage(''), 3000);
            }
        };

        // NOVAS FUNÇÕES para Gerenciar Status de Questões
        const handleUpdateQuestionStatus = async () => {
            if (!questionIdToUpdateStatus) {
                setStatusQuestionMessage('Por favor, insira o ID da questão.');
                setStatusQuestionType('error');
                return;
            }

            setIsStatusLoading(true);
            setStatusQuestionMessage('');
            setStatusQuestionType('');
            console.log(`AdminDashboard: handleUpdateQuestionStatus - Atualizando status para questão ID: ${questionIdToUpdateStatus}`); // LOG

            try {
                const payload = {
                    is_anulada: isAnulada,
                    is_desatualizada: isDesatualizada,
                };
                console.log("AdminDashboard: handleUpdateQuestionStatus - Payload de status:", payload); // LOG

                const response = await fetch(`${API_URL}/api/questions/${questionIdToUpdateStatus}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                console.log('AdminDashboard: handleUpdateQuestionStatus - Response status:', response.status); // LOG
                if (response.status === 401 || response.status === 403) {
                    console.error('AdminDashboard: handleUpdateQuestionStatus - Não autorizado ou proibido. Redirecionando...'); // LOG
                    onLogout(navigate('/login'));
                    return;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Falha ao atualizar o status da questão.');
                }

                setStatusQuestionMessage(`Status da questão ${questionIdToUpdateStatus} atualizado com sucesso!`);
                setStatusQuestionType('success');
                fetchQuestions(); // Recarrega a lista de questões para ver o status atualizado
            } catch (error) {
                console.error('AdminDashboard: handleUpdateQuestionStatus - Erro ao atualizar status da questão:', error); // LOG
                setStatusQuestionMessage('Erro ao atualizar status: ' + error.message);
                setStatusQuestionType('error');
            } finally {
                setIsStatusLoading(false);
                setTimeout(() => setStatusQuestionMessage(''), 3000);
            }
        };


        useEffect(() => {
            console.log("AdminDashboard: useEffect - Active tab changed to:", activeTab); // LOG
            if (!token) {
                console.log("AdminDashboard: useEffect - Token ausente, redirecionando para login."); // LOG
                navigate('/login');
                return;
            }
            if (activeTab === 'pendingUsers') {
                fetchPendingUsers();
            } else if (activeTab === 'gerenciar-questoes') {
                console.log('AdminDashboard: Ativada aba "Gerenciar Questões", chamando fetchQuestions().');
                fetchQuestions();
            } else if (activeTab === 'gerenciar-teoria') {
                fetchMateriasEAssuntos();
                fetchTheories();
            }
        }, [token, navigate, activeTab, fetchPendingUsers, fetchQuestions, fetchMateriasEAssuntos, fetchTheories]);

        // === RENDERIZAÇÃO DO COMPONENTE ===
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-inter">
                <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-100">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Painel do Administrador</h1>
                    <button
                        onClick={onLogout}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                        <LogOut className="mr-2" size={20} /> Sair
                    </button>
                </header>

                {statusMessage && (
                    <MessageModal
                        message={statusMessage}
                        type={statusType}
                        onClose={() => setStatusMessage('')}
                    />
                )}
                {theoryStatusMessage && (
                    <MessageModal
                        message={theoryStatusMessage}
                        type={theoryStatusType}
                        onClose={() => setTheoryStatusMessage('')}
                    />
                )}
                {pdfUploadMessage && (
                    <MessageModal
                        message={pdfUploadMessage}
                        type={pdfUploadMessageType}
                        onClose={() => setPdfUploadMessage('')}
                    />
                )}
                {statusQuestionMessage && (
                    <MessageModal
                        message={statusQuestionMessage}
                        type={statusQuestionType}
                        onClose={() => setStatusQuestionMessage('')}
                    />
                )}


                {/* Modal de Confirmação de Exclusão de Questão */}
                {showDeleteConfirmModal && (
                    <ActionModal
                        isOpen={showDeleteConfirmModal}
                        onClose={() => setShowDeleteConfirmModal(false)}
                        title="Confirmar Exclusão de Questão"
                        message="Tem certeza que deseja deletar esta questão? Esta ação não pode ser desfeita."
                        onConfirm={confirmDeleteQuestion}
                        confirmText={isQuestionLoading ? <span className="flex items-center"><Loader2 className="animate-spin h-5 w-5 mr-2" /> Deletando...</span> : 'Deletar'}
                        isConfirming={isQuestionLoading}
                        type="danger"
                    />
                )}

                {/* Modal de Confirmação de Exclusão de Teoria */}
                {showDeleteTheoryConfirmModal && (
                    <ActionModal
                        isOpen={showDeleteTheoryConfirmModal}
                        onClose={() => setShowDeleteTheoryConfirmModal(false)}
                        title="Confirmar Exclusão de Teoria"
                        message={`Tem certeza que deseja deletar a teoria de "${theoryToDelete?.materia}" - "${theoryToDelete?.assunto}"? Esta ação não pode ser desfeita.`}
                        onConfirm={confirmDeleteTheory}
                        confirmText={isTheoryLoading ? <span className="flex items-center"><Loader2 className="animate-spin h-5 w-5 mr-2" /> Deletando...</span> : 'Deletar'}
                        isConfirming={isTheoryLoading}
                        type="danger"
                    />
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
                >
                    <Tabs defaultValue="gerenciar-questoes" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-5 bg-gray-100 rounded-xl p-2 mb-8 shadow-inner">
                            <TabsTrigger value="pendingUsers" className="flex items-center justify-center py-3 px-4 text-lg font-semibold rounded-lg hover:bg-white hover:shadow-md transition-all duration-300">
                                <Users className="mr-2" size={20} /> Usuários Pendentes
                            </TabsTrigger>
                            <TabsTrigger value="gerenciar-questoes" className="flex items-center justify-center py-3 px-4 text-lg font-semibold rounded-lg hover:bg-white hover:shadow-md transition-all duration-300">
                                <FileText className="mr-2" size={20} /> Gerenciar Questões
                            </TabsTrigger>
                            <TabsTrigger value="upload-pdf" className="flex items-center justify-center py-3 px-4 text-lg font-semibold rounded-lg hover:bg-white hover:shadow-md transition-all duration-300">
                                <UploadCloud className="mr-2" size={20} /> Upload de PDF
                            </TabsTrigger>
                            <TabsTrigger value="gerenciar-teoria" className="flex items-center justify-center py-3 px-4 text-lg font-semibold rounded-lg hover:bg-white hover:shadow-md transition-all duration-300">
                                <BookOpen className="mr-2" size={20} /> Gerenciar Teoria
                            </TabsTrigger>
                            <TabsTrigger value="gerenciar-status-questoes" className="flex items-center justify-center py-3 px-4 text-lg font-semibold rounded-lg hover:bg-white hover:shadow-md transition-all duration-300">
                                <CircleDotDashed className="mr-2" size={20} /> Status Questões
                            </TabsTrigger>
                        </TabsList>

                        {statusMessage && (
                            <div className={`p-3 mb-4 rounded-lg text-center ${statusType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {statusMessage}
                            </div>
                        )}

                        {/* Conteúdo da Aba: Usuários Pendentes */}
                        <TabsContent value="pendingUsers">
                            <div className="bg-white p-6 rounded-b-lg shadow-md">
                                <h2 className="text-2xl font-bold mb-6 text-gray-800">Usuários Pendentes para Aprovação</h2>
                                {pendingUsers.length === 0 ? (
                                    <p className="text-gray-500 italic">Nenhum usuário pendente no momento.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {pendingUsers.map((user) => (
                                            <li key={user.id} className="flex justify-between items-center border border-gray-200 p-3 rounded hover:bg-gray-50">
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-gray-600 text-sm">{user.email}</p>
                                                </div>
                                                <div className="space-x-2">
                                                    <button
                                                        onClick={() => handleUserAction(user.id, 'approve')}
                                                        className="flex items-center px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all duration-300 text-xs"
                                                    >
                                                        Aprovar
                                                    </button>
                                                    <button
                                                        onClick={() => handleUserAction(user.id, 'reject')}
                                                        className="flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-all duration-300 text-xs"
                                                    >
                                                        Rejeitar
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </TabsContent>

                        {/* Conteúdo da Aba: Gerenciar Questões */}
                        <TabsContent value="gerenciar-questoes">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="p-8 mb-8 rounded-2xl shadow-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100"
                            >
                                <h3 className="text-2xl font-semibold text-blue-800 mb-4">{editingQuestion ? 'Editar Questão' : 'Criar Nova Questão'}</h3>
                                <QuestionForm
                                    question={editingQuestion}
                                    token={token}
                                    onSuccess={handleQuestionFormSubmit}
                                    isLoading={isQuestionLoading}
                                    onCancel={handleCancelEditQuestion}
                                />
                            </motion.div>

                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Questões Existentes</h2>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Buscar por ID ou enunciado"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                                />
                            </div>

                            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">ID</th>
                                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Matéria</th>
                                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Assunto</th>
                                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Banca</th>
                                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Tipo</th>
                                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Anulada</th>
                                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Desatualizada</th>
                                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedQuestions.map((question) => (
                                            <tr key={question.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="py-3 px-4 text-sm text-gray-800">{question.id}</td>
                                                <td className="py-3 px-4 text-sm text-gray-800">{question.materia}</td>
                                                <td className="py-3 px-4 text-sm text-gray-800">{question.assunto}</td>
                                                <td className="py-3 px-4 text-sm text-gray-800">{question.banca}</td>
                                                <td className="py-3 px-4 text-sm text-gray-800">{question.tipo === 'multipla' ? 'Múltipla Escolha' : 'Certo ou Errado'}</td>
                                                <td className="py-3 px-4 text-sm text-gray-800 text-center">
                                                    {question.isAnulada ? <CheckCircle className="text-red-500 w-5 h-5 mx-auto" /> : <XCircle className="text-gray-400 w-5 h-5 mx-auto" />}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-800 text-center">
                                                    {question.isDesatualizada ? <CheckCircle className="text-yellow-600 w-5 h-5 mx-auto" /> : <XCircle className="text-gray-400 w-5 h-5 mx-auto" />}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-800">
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => handleEditQuestion(question)}
                                                            className="text-blue-600 hover:text-blue-800 transition"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuestionClick(question.id)}
                                                            className="text-red-600 hover:text-red-800 transition"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-4 space-x-2">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-3 py-1 rounded-lg border ${
                                                currentPage === i + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-800'
                                            } hover:bg-blue-500 hover:text-white`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Conteúdo da Aba: Upload de PDF */}
                        <TabsContent value="upload-pdf">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Upload de PDF para IA</h2>
                            <form onSubmit={handlePdfUpload} className="space-y-6 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-lg font-semibold mb-3">
                                        Selecione o arquivo PDF:
                                    </label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handlePdfFileChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0 file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                                {file && (
                                    <p className="text-md text-gray-700 flex items-center bg-blue-50 p-3 rounded-lg shadow-inner">
                                        <FileText className="mr-3 text-blue-600" size={20} /> Arquivo selecionado: <span className="font-medium ml-1">{file.name}</span>
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
                                    disabled={isPdfUploadLoading || !file}
                                >
                                    {isPdfUploadLoading ? (
                                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    ) : (
                                        <>
                                            <UploadCloud className="mr-2" size={20} /> Processar PDF
                                        </>
                                    )}
                                </button>
                            </form>
                        </TabsContent>

                        {/* Conteúdo da Aba: Gerenciar Teoria */}
                        <TabsContent value="gerenciar-teoria">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Adicionar/Editar Teoria</h2>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="p-8 mb-8 rounded-2xl shadow-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100"
                            >
                                <TheoryForm
                                    token={token}
                                    onSuccess={handleSaveTheoryForm}
                                    isLoading={isTheoryLoading}
                                    materiasDisponiveis={allMaterias} 
                                    theory={editingTheory}
                                    onCancel={handleCancelEditTheory}
                                />
                            </motion.div>

                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Teorias Existentes</h2>
                            {isTheoryLoading && <p className="text-center text-gray-600 text-lg py-8 bg-gray-50 rounded-xl shadow-inner">Carregando teorias...</p>}
                            {!isTheoryLoading && theories.length === 0 && <p className="text-center text-gray-600 text-lg py-8 bg-gray-50 rounded-xl shadow-inner">Nenhuma teoria encontrada.</p>}
                            {!isTheoryLoading && theories.length > 0 && (
                                <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-4 px-6 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Matéria</th>
                                                <th className="py-4 px-6 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Assunto</th>
                                                <th className="py-4 px-6 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {theories.map((t, index) => (
                                                <tr key={`${t.materia}-${t.assunto}-${index}`} className="hover:bg-gray-50 transition-colors duration-200">
                                                    <td className="py-4 px-6 text-sm text-gray-800">{t.materia}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-800">{t.assunto}</td>
                                                    <td className="py-4 px-6 text-sm">
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={() => handleEditTheory(t.materia, t.assunto)}
                                                                className="text-blue-600 hover:text-blue-800 transition-all duration-300 transform hover:scale-110"
                                                                title="Editar Teoria"
                                                            >
                                                                <Edit size={22} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTheoryClick(t.materia, t.assunto)}
                                                                className="text-red-600 hover:text-red-800 transition-all duration-300 transform hover:scale-110"
                                                                title="Deletar Teoria"
                                                            >
                                                                <Trash2 size={22} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>

                        {/* NOVO: Conteúdo da Aba: Gerenciar Status de Questões */}
                        <TabsContent value="gerenciar-status-questoes">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gerenciar Status de Questões</h2>
                            <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-6">
                                <p className="text-gray-700 text-lg">Atualize o status de anulação ou desatualização de uma questão pelo seu ID.</p>
                                
                                <div>
                                    <label htmlFor="questionIdStatus" className="block text-gray-700 text-sm font-bold mb-2">
                                        ID da Questão:
                                    </label>
                                    <input
                                        type="number"
                                        id="questionIdStatus"
                                        value={questionIdToUpdateStatus}
                                        onChange={(e) => setQuestionIdToUpdateStatus(e.target.value)}
                                        placeholder="Ex: 12345"
                                        className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center text-gray-700 text-base font-semibold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isAnulada}
                                            onChange={(e) => setIsAnulada(e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-red-600 rounded-md transition duration-150 ease-in-out"
                                        />
                                        <span className="ml-2">Anulada</span>
                                    </label>
                                    <label className="flex items-center text-gray-700 text-base font-semibold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isDesatualizada}
                                            onChange={(e) => setIsDesatualizada(e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-yellow-600 rounded-md transition duration-150 ease-in-out"
                                        />
                                        <span className="ml-2">Desatualizada</span>
                                    </label>
                                </div>

                                <button
                                    onClick={handleUpdateQuestionStatus}
                                    className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={isStatusLoading || !questionIdToUpdateStatus}
                                >
                                    {isStatusLoading ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                            Atualizando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2" size={20} /> Atualizar Status
                                        </>
                                    )}
                                </button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        );
    }
    













































