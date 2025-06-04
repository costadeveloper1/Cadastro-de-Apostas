import React from 'react';

const Reports = ({ bets, timeIntervals, championships }) => {

  // Performance by time interval (lógica movida para cá)
  const intervalStats = timeIntervals.map(interval => {
    const intervalBets = bets.filter(bet => bet.market === interval);
    const wins = intervalBets.filter(bet => bet.result === 'green').length;
    const total = intervalBets.length;
    const winRate = total > 0 ? (wins / total * 100) : 0;
    const profit = intervalBets.reduce((sum, bet) => sum + bet.profit, 0);
    
    return {
      interval,
      total,
      wins,
      winRate: winRate.toFixed(1),
      profit: profit.toFixed(2)
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Performance por Intervalo de Tempo</h3>
        </div>
        <div className="p-4">
          {intervalStats.length > 0 ? (
            <div className="grid gap-4">
              {intervalStats.map(stat => (
                <div key={stat.interval} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-4">
                    <div className="font-medium">{stat.interval} min</div>
                    <div className="text-sm text-gray-600">
                      {stat.wins}/{stat.total} apostas
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`font-medium ${
                      parseFloat(stat.winRate) >= 60 ? 'text-green-600' : 
                      parseFloat(stat.winRate) >= 40 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {stat.winRate}%
                    </div>
                    <div className={`font-medium ${
                      parseFloat(stat.profit) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(stat.profit) >= 0 ? '+' : ''}R$ {stat.profit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Sem dados suficientes para exibir performance por intervalo.</p>
          )}
        </div>
      </div>

      {/* Championship Performance */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Performance por Campeonato</h3>
        </div>
        <div className="p-4">
          {championships.length > 0 ? (
            <div className="grid gap-4">
              {championships.map(champ => {
                const champBets = bets.filter(bet => bet.championship === champ);
                const wins = champBets.filter(bet => bet.result === 'green').length;
                const total = champBets.length;
                const winRate = total > 0 ? (wins / total * 100) : 0;
                const profit = champBets.reduce((sum, bet) => sum + bet.profit, 0);
                
                if (total === 0) return null;
                
                return (
                  <div key={champ} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{champ}</div>
                      <div className="text-sm text-gray-600">
                        {wins}/{total} apostas
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`font-medium ${
                        winRate >= 60 ? 'text-green-600' : 
                        winRate >= 40 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {winRate.toFixed(1)}%
                      </div>
                      <div className={`font-medium ${
                        profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {profit >= 0 ? '+' : ''}R$ {profit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean)
              // Adicionar mensagem caso nenhum campeonato tenha dados
              .filter(item => item !== null).length === 0 && (
                 <p className="text-center text-gray-500 py-4">Sem dados suficientes para exibir performance por campeonato.</p>
              )
            }
            </div>
          ) : (
             <p className="text-center text-gray-500 py-4">Nenhum campeonato cadastrado para exibir performance.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports; 