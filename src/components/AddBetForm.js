import React, { useEffect, useState, useMemo } from 'react';
import { X, CalendarDays, Clock, Shield, Users, BarChartBig, TrendingUp, Percent, Edit3, Save, PlusSquare } from 'lucide-react';

const AddBetForm = ({
  show,
  onClose,
  formData,
  handleInputChange,
  handleSubmit,
  timeIntervals,
  championships,
  calculateProfit,
  editingBet
}) => {
  const [estimatedProfit, setEstimatedProfit] = useState(0);

  useEffect(() => {
    if (formData.odd && formData.result && formData.stake) {
      const profit = calculateProfit(formData.odd, formData.result, formData.stake);
      setEstimatedProfit(profit);
    } else {
      setEstimatedProfit(0);
    }
  }, [formData.odd, formData.result, formData.stake, calculateProfit]);

  const resultOptions = useMemo(() => [
    { value: 'green', label: 'Green (Ganha)' },
    { value: 'red', label: 'Red (Perdida)' },
    { value: 'Devolvida', label: 'Devolvida' },
  ], []);

  if (!show) {
    return null;
  }

  const formTitle = editingBet ? "Editar Aposta" : "Adicionar Nova Aposta";
  const submitButtonText = editingBet ? "Atualizar Aposta" : "Adicionar Aposta";
  const SubmitIcon = editingBet ? Save : PlusSquare;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-40">
      <div className="bg-green-800 p-5 rounded-lg shadow-xl w-full max-w-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-green-300 hover:text-yellow-400"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
          {editingBet ? <Edit3 size={22} className="mr-2 text-yellow-400" /> : <PlusSquare size={22} className="mr-2 text-yellow-400" />}
          {formTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-green-200 mb-1 flex items-center"><CalendarDays size={14} className="mr-1.5"/>Data:</label>
              <input type="date" id="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} className="w-full p-2 rounded bg-green-700 border border-green-600 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label htmlFor="championship" className="block text-sm font-medium text-green-200 mb-1 flex items-center"><Shield size={14} className="mr-1.5"/>Campeonato:</label>
              <select id="championship" value={formData.championship} onChange={(e) => handleInputChange('championship', e.target.value)} className="w-full p-2 rounded bg-green-700 border border-green-600 focus:ring-yellow-400 focus:border-yellow-400">
                <option value="">Selecione o Campeonato</option>
                {championships.map(champ => <option key={champ} value={champ}>{champ}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="homeTeam" className="block text-sm font-medium text-green-200 mb-1 flex items-center"><Users size={14} className="mr-1.5"/>Time da Casa:</label>
              <input type="text" id="homeTeam" placeholder="Ex: Flamengo" value={formData.homeTeam} onChange={(e) => handleInputChange('homeTeam', e.target.value)} className="w-full p-2 rounded bg-green-700 border border-green-600 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label htmlFor="awayTeam" className="block text-sm font-medium text-green-200 mb-1 flex items-center"><Users size={14} className="mr-1.5"/>Time Visitante:</label>
              <input type="text" id="awayTeam" placeholder="Ex: Palmeiras" value={formData.awayTeam} onChange={(e) => handleInputChange('awayTeam', e.target.value)} className="w-full p-2 rounded bg-green-700 border border-green-600 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="marketMinutes" className="block text-sm font-medium text-green-200 mb-1 flex items-center"><Clock size={14} className="mr-1.5"/>Intervalo de Minutos:</label>
              <select id="marketMinutes" value={formData.marketMinutes} onChange={(e) => handleInputChange('marketMinutes', e.target.value)} className="w-full p-2 rounded bg-green-700 border border-green-600 focus:ring-yellow-400 focus:border-yellow-400">
                <option value="">Selecione o Intervalo</option>
                {timeIntervals.map(interval => <option key={interval} value={interval}>{interval}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="odd" className="block text-sm font-medium text-green-200 mb-1 flex items-center"><Percent size={14} className="mr-1.5"/>Odd:</label>
              <input type="text" id="odd" placeholder="Ex: 1.85 ou 2,00" value={formData.odd} onChange={(e) => handleInputChange('odd', e.target.value)} className="w-full p-2 rounded bg-green-700 border border-green-600 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label htmlFor="stake" className="block text-sm font-medium text-green-200 mb-1 flex items-center"><BarChartBig size={14} className="mr-1.5"/>Entrada (R$):</label>
              <input type="number" id="stake" placeholder="Ex: 100" value={formData.stake} onChange={(e) => handleInputChange('stake', e.target.value)} className="w-full p-2 rounded bg-green-700 border border-green-600 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
             <div>
              <label htmlFor="result" className="block text-sm font-medium text-green-200 mb-1 flex items-center"><TrendingUp size={14} className="mr-1.5"/>Resultado:</label>
              <select id="result" value={formData.result} onChange={(e) => handleInputChange('result', e.target.value)} className="w-full p-2 rounded bg-green-700 border border-green-600 focus:ring-yellow-400 focus:border-yellow-400">
                <option value="">Selecione o Resultado</option>
                {resultOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-3 space-y-3">
          <div className="text-center">
            <p className="text-sm text-green-200">Lucro/Perda Estimado(a): 
              <span className={`font-bold ${estimatedProfit > 0 ? 'text-green-400' : estimatedProfit < 0 ? 'text-red-400' : 'text-yellow-300'}`}>
                R$ {estimatedProfit.toFixed(2).replace('.', ',')}
              </span>
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 rounded text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white transition-colors">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-green-900 transition-colors flex items-center">
              <SubmitIcon size={18} className="mr-1.5" /> {submitButtonText}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddBetForm; 