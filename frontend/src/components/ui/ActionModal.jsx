import React from 'react';
import { XCircle, AlertCircle, Loader2 } from 'lucide-react'; // ✅ Loader2 foi adicionado aqui!

export default function ActionModal({ isOpen, onClose, title, message, children, onConfirm, confirmText, isConfirming, showCancelButton = true, type = 'info' }) {
    if (!isOpen) return null;

    const headerClasses = {
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500'
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in">
                <div className={`p-4 rounded-t-lg flex justify-between items-center ${headerClasses[type] || 'bg-gray-700'} text-white`}>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    {message && (
                        <p className="text-gray-700 mb-4">{message}</p>
                    )}
                    {children}
                    <div className="mt-6 flex justify-end space-x-3">
                        {showCancelButton && (
                            <button
                                onClick={onClose}
                                className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                            >
                                Cancelar
                            </button>
                        )}
                        {onConfirm && (
                            <button
                                onClick={onConfirm}
                                disabled={isConfirming}
                                className={`px-5 py-2 rounded-lg font-semibold transition-colors
                                    ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                                    ${isConfirming ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {/* O Loader2 aqui agora está definido */}
                                {isConfirming ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : confirmText || 'Confirmar'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Animações CSS */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}