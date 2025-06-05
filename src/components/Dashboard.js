import React, { useState } from 'react';
import { Upload, Plus } from 'lucide-react';
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

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    clearImportFeedback();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 flex-grow text-center">Histórico de Apostas</h2>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleImportClick}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 sm:px-4 rounded-md flex items-center justify-center text-xs sm:text-sm transition-colors shadow-md hover:shadow-lg"
            >
              <Upload size={16} className="mr-1 sm:mr-2" />
              Importar Histórico
            </button>
            <button
              onClick={onShowAddForm}
              className="bg-gray-600 hover:bg-gray-500 text-gray-100 font-medium py-2 px-3 sm:px-4 rounded-md flex items-center text-xs sm:text-sm transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={16} className="mr-1 sm:mr-2" />
              Nova Aposta
            </button>
          </div>
        </div>

        <BettingTable 
          bets={bets} 
          onEditBet={onEditBet} 
          onDeleteBet={onDeleteBet} 
        />
      </div>

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
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