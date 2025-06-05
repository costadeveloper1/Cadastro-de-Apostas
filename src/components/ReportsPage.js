import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TrendingUp, Target, BarChart3, HelpCircle, TrendingDown } from 'lucide-react';
import StatsCard from './StatsCard';

// Função auxiliar para formatar datas para input (YYYY-MM-DD)
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const ReportsPage = ({ allBetsFromTracker }) => {
  console.log("--- ReportsPage Iniciada, allBetsFromTracker count:", allBetsFromTracker?.length);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const setPeriodToday = () => {
    const today = new Date();
    setStartDate(formatDateForInput(today));
    setEndDate(formatDateForInput(today));
  };

  const setPeriodLastWeek = () => {
    const today = new Date();
    const lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    setStartDate(formatDateForInput(lastWeekStart));
    setEndDate(formatDateForInput(today));
  };

  const setPeriodLast30Days = () => {
    const today = new Date();
    const last30DaysStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
    setStartDate(formatDateForInput(last30DaysStart));
    setEndDate(formatDateForInput(today));
  };

  const setPeriodThisYear = () => {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    setStartDate(formatDateForInput(yearStart));
    setEndDate(formatDateForInput(today));
  };

  const setPeriodSinceBeginning = useCallback(() => {
    if (allBetsFromTracker && allBetsFromTracker.length > 0) {
      const sortedBets = [...allBetsFromTracker].sort((a, b) => new Date(a.date) - new Date(b.date));
      setStartDate(formatDateForInput(new Date(sortedBets[0]?.date || new Date()))); 
      setEndDate(formatDateForInput(new Date()));
    } else {
      const todayFormatted = formatDateForInput(new Date());
      setStartDate(todayFormatted);
      setEndDate(todayFormatted);
    }
  }, [allBetsFromTracker]);
  
  useEffect(() => {
    setPeriodSinceBeginning();
  }, [setPeriodSinceBeginning]);

  const filteredBets = useMemo(() => {
    if (!allBetsFromTracker || !startDate || !endDate) return []; 
    
    const filterStart = new Date(startDate + "T00:00:00Z");
    const filterEnd = new Date(endDate + "T23:59:59Z");

    if (filterStart > filterEnd) return [];

    return allBetsFromTracker.filter(bet => {
      if (!bet.date) return false; 
      const betDate = new Date(bet.date + "T00:00:00Z"); 
      return betDate >= filterStart && betDate <= filterEnd;
    });
  }, [allBetsFromTracker, startDate, endDate]);

  const stats = useMemo(() => {
    const betsToAnalyze = filteredBets;
    const totalBets = betsToAnalyze.length;
    const wonBets = betsToAnalyze.filter(bet => bet.status === 'Green').length;
    const voidBets = betsToAnalyze.filter(bet => bet.status === 'Void').length;
    const halfWonBets = betsToAnalyze.filter(bet => bet.status === 'HalfWon').length;
    const halfLostBets = betsToAnalyze.filter(bet => bet.status === 'HalfLost').length;
    const totalInvested = betsToAnalyze.reduce((acc, bet) => acc + parseFloat(bet.value || 0), 0);
    const totalReturn = betsToAnalyze.reduce((acc, bet) => {
        const value = parseFloat(bet.value || 0);
        const odd = parseFloat(bet.odd || 0);
        if (bet.status === 'Green') return acc + (value * odd);
        if (bet.status === 'HalfWon') return acc + value + (value * (odd - 1) / 2); 
        if (bet.status === 'HalfLost') return acc + (value / 2);
        if (bet.status === 'Void') return acc + value;
        return acc;
    }, 0);
    const profit = totalReturn - totalInvested;
    const effectiveWins = wonBets + (halfWonBets * 0.5);
    const countableBetsForHitRate = totalBets - voidBets - (halfWonBets * 0.5) - (halfLostBets * 0.5);
    const hitRate = countableBetsForHitRate > 0 ? (effectiveWins / countableBetsForHitRate) * 100 : 0;
    const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
    const greenOrRedBets = betsToAnalyze.filter(bet => bet.status === 'Green' || bet.status === 'Red');
    const averageOdd = greenOrRedBets.length > 0 
        ? greenOrRedBets.reduce((acc, bet) => acc + parseFloat(bet.odd || 0), 0) / greenOrRedBets.length
        : 0;
    return { profit, hitRate, roi, totalBets, averageOdd };
  }, [filteredBets]);

  const roiTooltipText = "ROI (Retorno Sobre o Investimento) mede o lucro ou prejuízo de um investimento em relação ao custo.";

  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-6">Relatórios Detalhados</h2>

      <div className="bg-gray-800 shadow-lg rounded-lg p-3 sm:p-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-200 mb-3 sm:mb-4">Período</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <label htmlFor="startDate" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">Data Inicial:</label>
            <input 
              type="date" 
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">Data Final:</label>
            <input 
              type="date" 
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          <button onClick={setPeriodToday} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm transition-colors">Hoje</button>
          <button onClick={setPeriodLastWeek} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm transition-colors">Última Semana</button>
          <button onClick={setPeriodLast30Days} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm transition-colors">Últimos 30 Dias</button>
          <button onClick={setPeriodThisYear} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm transition-colors">Este Ano</button>
          <button onClick={setPeriodSinceBeginning} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm transition-colors">Desde o Início</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatsCard title="LUCRO TOTAL" value={typeof stats.profit === 'number' ? `R$ ${stats.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'} icon={<TrendingUp size={20} className="text-green-400" />} />
        <StatsCard title="TAXA DE ACERTO" value={typeof stats.hitRate === 'number' ? `${stats.hitRate.toFixed(1)}%` : '0.0%'} icon={<Target size={20} className="text-blue-400" />} />
        <StatsCard title="ROI" value={typeof stats.roi === 'number' ? `${stats.roi.toFixed(1)}%` : '0.0%'} icon={<BarChart3 size={20} className="text-purple-400" />} tooltipText={roiTooltipText} />
        <StatsCard title="TOTAL DE APOSTAS" value={stats.totalBets || 0} icon={<TrendingDown size={20} className="text-yellow-400" />} />
        <StatsCard title="ODD MÉDIA" value={typeof stats.averageOdd === 'number' ? stats.averageOdd.toFixed(2) : '0.00'} icon={<HelpCircle size={20} className="text-teal-400" />} />
      </div>

      <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-200 mb-3">Lucro Acumulado</h3>
        <p className="text-gray-400 text-center py-8">(Em breve: Gráfico mostrando a evolução do lucro)</p>
      </div>

      <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-200 mb-3">Desempenho por Período (Ex: Mensal)</h3>
        <p className="text-gray-400 text-center py-8">(Em breve: Gráfico de barras do lucro/prejuízo consolidado)</p>
      </div>
    </div>
  );
};

export default ReportsPage;