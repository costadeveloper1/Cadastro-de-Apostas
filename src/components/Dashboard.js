import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Upload } from 'lucide-react';
import BettingTable from './BettingTable';
import ImportModal from './ImportModal';

const Dashboard = ({ 
  onShowAddForm, 
  bets,
  onFileUpload,
  onEditBet,
  onDeleteBet,
  isImporting,
  importFeedback,
  clearImportFeedback,
  onDeleteBetsByDate
}) => {
  const [showImportModal, setShowImportModal] = useState(false);

  const handleCloseImportModal = useCallback(() => {
    setShowImportModal(false);
    if (importFeedback && importFeedback.message) {
      clearImportFeedback();
    }
  }, [importFeedback, clearImportFeedback]);

  useEffect(() => {
    if (
      (importFeedback.type === 'success' || importFeedback.type === 'info') &&
      importFeedback.message && 
      showImportModal
    ) {
      const timer = setTimeout(() => {
        handleCloseImportModal();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [importFeedback, showImportModal, handleCloseImportModal]);

  return (
    <div className="flex flex-col h-full">
      {/* Card Principal */}
      <div className="bg-green-800 rounded-lg shadow flex flex-col h-full">
        {/* Cabeçalho com título centralizado e botões à direita */}
        <div className="p-4 flex items-center">
          <h3 className="text-2xl font-bold text-white flex-1 text-center">Histórico de Apostas</h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowImportModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded text-sm transition-colors duration-150 flex items-center"
            >
              <Upload size={16} className="mr-1" />
              Importar Apostas
            </button>
            <button 
              onClick={onShowAddForm}
              className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold py-2 px-4 rounded text-sm transition-colors duration-150 flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Nova Aposta
            </button>
          </div>
        </div>
        
        {/* Área da Tabela */}
        <div className="flex-1">
          <BettingTable 
            bets={bets}
            onEdit={onEditBet}
            onDelete={onDeleteBet}
          />
        </div>
      </div>

      {showImportModal && (
        <ImportModal 
          show={showImportModal} 
          onClose={handleCloseImportModal} 
          onConfirmImport={onFileUpload}
          isImporting={isImporting}
          feedback={importFeedback}
          clearFeedback={clearImportFeedback}
          onDeleteBetsByDate={onDeleteBetsByDate}
        />
      )}
    </div>
  );
};

export default Dashboard; 