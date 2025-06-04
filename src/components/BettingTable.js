import React, { useState } from 'react';
import { formatCurrency, formatOdd, getStatusClassAndText, formatDateDisplay } from '../utils/formatters'; // formatDateDisplay adicionado
import { MoreHorizontal, Edit3, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'; // Ícones para paginação

const BETS_PER_PAGE = 50;

const BettingTable = ({ bets, onEdit, onDelete }) => {
  const [activeDropdown, setActiveDropdown] = useState(null); // ID da aposta cujo dropdown está ativo
  const [currentPage, setCurrentPage] = useState(1);

  const toggleDropdown = (betId) => {
    setActiveDropdown(activeDropdown === betId ? null : betId);
  };

  const handleEdit = (bet) => {
    onEdit(bet); // onEdit deve receber o objeto da aposta completo
    setActiveDropdown(null);
  };

  const handleDelete = (betId) => {
    if (window.confirm('Tem certeza que deseja excluir esta aposta?')) {
      onDelete(betId);
    }
    setActiveDropdown(null);
  };

  if (!bets || bets.length === 0) {
    return <p className="text-center text-green-300 py-4">Nenhuma aposta registrada ainda.</p>;
  }

  // Ordenar as apostas por data, times e mercado
  const sortedBets = [...bets].sort((a, b) => {
    // Primeiro, comparar as datas (ordem decrescente)
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    
    // Se as datas forem iguais, criar uma chave única para o jogo
    const getGameKey = (bet) => {
      return `${bet.homeTeam || ''}|${bet.awayTeam || ''}`.toLowerCase();
    };
    
    const gameKeyA = getGameKey(a);
    const gameKeyB = getGameKey(b);
    
    if (gameKeyA !== gameKeyB) {
      return gameKeyA.localeCompare(gameKeyB);
    }
    
    // Se for o mesmo jogo, ordenar pelo mercado (minutos) em ordem decrescente
    const getMinutes = (market) => {
      const match = market?.match(/(\d+)/);
      return match ? parseInt(match[1]) : -1;
    };
    
    const aMinutes = getMinutes(a.marketMinutes);
    const bMinutes = getMinutes(b.marketMinutes);
    return bMinutes - aMinutes;
  });

  // Lógica de Paginação
  const indexOfLastBet = currentPage * BETS_PER_PAGE;
  const indexOfFirstBet = indexOfLastBet - BETS_PER_PAGE;
  const currentBetsToDisplay = sortedBets.slice(indexOfFirstBet, indexOfLastBet);
  const totalPages = Math.ceil(sortedBets.length / BETS_PER_PAGE);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="w-full">
      <table className="min-w-full">
        <thead>
          <tr className="bg-green-600">
            <th className="px-4 py-2 text-left text-xs font-medium text-green-200 uppercase">Data</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-green-200 uppercase">Campeonato</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-green-200 uppercase">Casa</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-green-200 uppercase">Fora</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-green-200 uppercase">Entrada (R$)</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-green-200 uppercase">Mercado</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-green-200 uppercase">Odd</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-green-200 uppercase">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-green-200 uppercase">Lucro (R$)</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-green-200 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-green-700">
          {currentBetsToDisplay.map((bet) => {
            const { statusText, className: statusClassName } = getStatusClassAndText(bet);
            return (
              <tr key={bet.id} className="border-b border-green-600 hover:bg-green-650">
                <td className="px-4 py-2 text-sm text-gray-200">{formatDateDisplay(bet.date)}</td>
                <td className="px-4 py-2 text-sm text-gray-200">{bet.championship || 'N/A'}</td>
                <td className="px-4 py-2 text-sm text-gray-200">{bet.homeTeam || 'N/A'}</td>
                <td className="px-4 py-2 text-sm text-gray-200">{bet.awayTeam || 'N/A'}</td>
                <td className="px-4 py-2 text-sm text-gray-200">{formatCurrency(bet.stake)}</td>
                <td className="px-4 py-2 text-sm text-gray-200">{bet.marketMinutes || bet.market || 'N/A'}</td>
                <td className="px-4 py-2 text-sm text-gray-200">{formatOdd(bet.odd)}</td>
                <td className={`px-4 py-2 text-sm ${statusClassName}`}>{statusText}</td>
                <td className={`px-4 py-2 text-sm ${bet.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(bet.profit)}
                </td>
                <td className="px-4 py-2 text-sm text-center relative">
                  <button 
                    onClick={() => toggleDropdown(bet.id)}
                    className="text-gray-300 hover:text-yellow-400 p-1 rounded-full hover:bg-green-600"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {activeDropdown === bet.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-green-600 border border-green-500 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => handleEdit(bet)}
                        className="flex items-center w-full px-4 py-2 text-sm text-left text-green-200 hover:bg-green-500 hover:text-yellow-300"
                      >
                        <Edit3 size={16} className="mr-2" /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(bet.id)}
                        className="flex items-center w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} className="mr-2" /> Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="py-3 flex items-center justify-center gap-3 text-sm text-green-200">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" /> Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Próxima <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BettingTable; 