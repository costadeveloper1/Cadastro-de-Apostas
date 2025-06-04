import React, { useState, useEffect } from 'react';
import { X, Upload, CalendarDays, Loader2, Trash2 } from 'lucide-react';

const ImportModal = ({ 
  show, 
  onClose, 
  onConfirmImport, 
  isImporting, 
  feedback, 
  clearFeedback,
  onDeleteBetsByDate
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Limpar o arquivo selecionado e o feedback quando o modal é reaberto ou fechado
  useEffect(() => {
    if (show) {
      // Não limpar selectedFile ou selectedDate aqui para permitir que o usuário veja suas seleções
      // O feedback é limpo pelo onClose no Dashboard
    } else {
      setSelectedFile(null);
      // Opcional: resetar a data ao fechar, ou manter a última selecionada
      // setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  }, [show]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    if (feedback && feedback.message) clearFeedback(); // Limpa feedback antigo ao selecionar novo arquivo
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    if (feedback && feedback.message) clearFeedback(); // Limpa feedback antigo ao mudar data
  }

  const handleConfirm = () => {
    // As validações de data e arquivo agora são feitas em handleFileUpload no BettingTracker
    // e o feedback é mostrado lá.
    onConfirmImport(selectedFile, selectedDate);
    // Não fechar o modal aqui, ele permanecerá aberto para mostrar o feedback.
    // O usuário fechará manualmente.
  };

  const handleDeleteByDate = () => {
    if (onDeleteBetsByDate) {
      onDeleteBetsByDate(selectedDate);
      // Não fechar o modal aqui, a função de exclusão definirá o feedback
      // e o modal fechará automaticamente se o feedback for success/info
    }
  };

  if (!show) {
    return null;
  }

  const feedbackColor = feedback.type === 'success' ? 'text-green-300' :
                        feedback.type === 'error'   ? 'text-red-300' :
                        feedback.type === 'info'    ? 'text-blue-300' :
                                                      'text-gray-300';
  const formattedSelectedDateForButton = selectedDate 
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR') 
    : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-green-800 p-6 rounded-lg shadow-xl w-full max-w-md space-y-4 relative">
        <button 
          onClick={onClose} // onClose agora também limpa o feedback (configurado no Dashboard)
          className="absolute top-3 right-3 text-green-300 hover:text-yellow-400 disabled:opacity-50"
          disabled={isImporting}
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">Importar Histórico do Arquivo</h2>
        
        <div className="space-y-3">
          <div>
            <label htmlFor="import-modal-date" className="block text-sm font-medium text-green-200 mb-1 flex items-center">
              <CalendarDays size={16} className="mr-2" /> Data das Apostas:
            </label>
            <input 
              type="date" 
              id="import-modal-date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full p-2 rounded bg-green-700 text-white border border-green-600 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isImporting}
            />
          </div>
          <div>
            <label htmlFor="import-modal-file" className="block text-sm font-medium text-green-200 mb-1 flex items-center">
              <Upload size={16} className="mr-2"/> Arquivo HTML:
            </label>
            <input 
              type="file" 
              id="import-modal-file"
              accept=".html" 
              onChange={handleFileChange}
              className="w-full text-sm text-green-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-green-900 hover:file:bg-yellow-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isImporting}
            />
          </div>
        </div>

        {/* Área de Feedback */} 
        {feedback && feedback.message && (
          <div className={`mt-3 p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-600' : feedback.type === 'error' ? 'bg-red-700' : 'bg-blue-700'}`}>
            <p className={feedbackColor}>{feedback.message}</p>
          </div>
        )}

        {/* Indicador de Carregamento */} 
        {isImporting && (
          <div className="flex items-center justify-center text-yellow-400 mt-3">
            <Loader2 size={20} className="animate-spin mr-2" />
            Processando arquivo...
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          {/* Botão de Excluir à Esquerda */} 
          <button
            onClick={handleDeleteByDate}
            className="px-4 py-2 rounded text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isImporting || !selectedDate} // Desabilitado se importando ou sem data
            title={selectedDate ? `Excluir todas as apostas do dia ${formattedSelectedDateForButton}` : "Selecione uma data para excluir"}
          >
            <Trash2 size={16} className="mr-2" />
            Excluir Dia
          </button>

          {/* Botões de Cancelar e Confirmar à Direita */} 
          <div className="flex space-x-3">
            <button 
              onClick={onClose} // onClose agora também limpa o feedback
              className="px-4 py-2 rounded text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isImporting}
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirm} 
              className="px-4 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isImporting || !selectedFile || !selectedDate}
            >
              {isImporting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Upload size={16} className="mr-2" />
              )}
              {isImporting ? 'Importando...' : 'Confirmar Importação'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal; 