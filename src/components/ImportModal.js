import React, { useState } from 'react';
import { X, Upload, CalendarDays } from 'lucide-react';

const ImportModal = ({ show, onClose, onConfirmImport }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleConfirm = () => {
    if (!selectedDate) {
      alert('Por favor, selecione uma data para as apostas.');
      return;
    }
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo HTML.');
      return;
    }
    onConfirmImport(selectedFile, selectedDate);
    onClose(); // Fecha o modal após a tentativa de confirmação
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-green-800 p-6 rounded-lg shadow-xl w-full max-w-md space-y-4 relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-green-300 hover:text-yellow-400"
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
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 rounded bg-green-700 text-white border border-green-600 focus:ring-yellow-400 focus:border-yellow-400"
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
              className="w-full text-sm text-green-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-green-900 hover:file:bg-yellow-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm} 
            className="px-4 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center"
          >
            <Upload size={16} className="mr-2" />
            Confirmar Importação
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal; 