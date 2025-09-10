import React, { useState, useEffect } from 'react';

export default function ContatosModal({ isOpen, onClose, onSave, initialData }) { // Removido o valor padrão {}
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
  if (initialData) {
    const data = initialData.contatos ? initialData.contatos : initialData;
    setEmail(data.email || '');
    setTelefone(data.telefone || '');
    setWhatsapp(data.whatsapp || '');
  } else {
    setEmail('');
    setTelefone('');
    setWhatsapp('');
  }
}, [initialData, isOpen]);

  const handleSave = async () => {
  setIsSaving(true);
  const contatosData = {
    email,
    telefone,
    whatsapp,
  };
  await onSave(contatosData); // já manda direto
  setIsSaving(false);
  onClose(); 
};

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Adicionar/Editar Contatos</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="seu.email@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="(99) 99999-9999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="(99) 99999-9999"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
