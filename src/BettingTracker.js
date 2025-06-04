import React, { useState, useEffect, useMemo } from 'react';
import { Plus, TrendingUp, BarChart3, Target, Calendar, Filter, Instagram, Linkedin, Github, Mail, Twitter } from 'lucide-react';
import AddBetForm from './components/AddBetForm';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import StatsCard from './components/StatsCard';

const BettingTracker = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [bets, setBets] = useState(() => {
    const savedBets = localStorage.getItem('bettingTrackerBets');
    if (savedBets) {
      try {
        const parsedBets = JSON.parse(savedBets);
        // Validar se parsedBets é um array; caso contrário, retornar array de exemplo
        return Array.isArray(parsedBets) ? parsedBets : []; 
      } catch (error) {
        console.error("Erro ao parsear apostas do localStorage:", error);
        return []; // Retornar array vazio em caso de erro no parse
      }
    } else {
      // Removidos os dados de exemplo daqui para um localStorage mais limpo inicialmente
      // Ou, se preferir, pode manter os dados de exemplo se 'savedBets' for nulo.
      // Por ora, retornarei um array vazio se nada for encontrado.
      return []; 
    }
  });

  useEffect(() => {
    localStorage.setItem('bettingTrackerBets', JSON.stringify(bets));
  }, [bets]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBet, setEditingBet] = useState(null);
  
  const initialFormData = {
    date: new Date().toISOString().split('T')[0],
    championship: '',
    homeTeam: '',
    awayTeam: '',
    marketMinutes: '',
    odd: '',
    result: '',
    stake: 100
  };
  const [formData, setFormData] = useState(initialFormData);

  const timeIntervals = useMemo(() => [
    '0-9:59', '10-19:59', '20-29:59', '30-39:59', '40-49:59',
    '50-59:59', '60-69:59', '70-79:59', '80-fim'
  ], []);

  const championships = useMemo(() => [
    'Brasileirão Série A', 'Brasileirão Série B', 'Brasileirão Série C', 'Copa do Brasil',
    'Premier League', 'Championship', 'League One', 'FA Cup',
    'Bundesliga', '2. Bundesliga', '3. Liga', 'DFB Pokal',
    'Serie A', 'Serie B', 'Serie C', 'Coppa Italia',
    'La Liga', 'Segunda División', 'Copa del Rey',
    'Ligue 1', 'Ligue 2', 'Coupe de France',
    'Champions League', 'Europa League', 'Conference League', 'Copa Libertadores', 'Copa Sudamericana',
    'Outro'
  ], []);

  useEffect(() => {
    if (editingBet) {
      setFormData({
        date: editingBet.date,
        championship: editingBet.championship,
        homeTeam: editingBet.homeTeam,
        awayTeam: editingBet.awayTeam,
        marketMinutes: editingBet.marketMinutes,
        odd: String(editingBet.odd).replace('.', ','), 
        result: editingBet.result || (editingBet.status === 'won' ? 'Ganha' : editingBet.status === 'lost' ? 'Perdida' : editingBet.status === 'void' ? 'Devolvida' : editingBet.status === 'cashed_out' ? 'Cashout' : ''),
        stake: editingBet.stake
      });
      setShowAddForm(true);
    } else {
      setFormData(initialFormData);
    }
  }, [editingBet, initialFormData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateProfit = (odd, result, stake) => {
    const numericOdd = parseFloat(String(odd).replace(',', '.'));
    const numericStake = parseFloat(stake);

    if (result === 'green' || result === 'Ganha') {
      return (numericOdd - 1) * numericStake;
    } else if (result === 'red' || result === 'Perdida') {
      return -numericStake;
    } else if (result === 'Devolvida' || result === 'Cashout' || result === 'void') {
      return 0;
    }
    return 0;
  };

  const handleSubmit = () => {
    if (!formData.homeTeam || !formData.awayTeam || !formData.marketMinutes || !formData.odd || !formData.result || !formData.championship || !formData.stake) {
      alert('Preencha todos os campos obrigatórios: Data, Campeonato, Time da Casa, Time Visitante, Intervalo de Minutos, Odd, Resultado e Entrada!');
      return;
    }

    const profit = calculateProfit(formData.odd, formData.result, formData.stake);
    
    const betData = {
      date: formData.date,
      championship: formData.championship,
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      marketMinutes: formData.marketMinutes,
      odd: parseFloat(String(formData.odd).replace(',', '.')),
      result: formData.result,
      stake: parseFloat(formData.stake),
      profit: profit,
    };

    if (editingBet) {
      setBets(prevBets => prevBets.map(b => b.id === editingBet.id ? { ...b, ...betData, id: editingBet.id, timestamp: editingBet.timestamp || new Date().toISOString() } : b));
      setEditingBet(null);
      alert('Aposta atualizada com sucesso!');
    } else {
      const newBet = {
        ...betData,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      setBets(prev => [newBet, ...prev]);
      alert('Aposta adicionada com sucesso!');
    }
    
    setFormData(initialFormData);
    setShowAddForm(false);
  };

  const handleOpenAddForm = () => {
    setEditingBet(null);
    setFormData(initialFormData);
    setShowAddForm(true);
  };

  const handleEditBet = (betToEdit) => {
    setEditingBet(betToEdit);
  };

  const handleDeleteBet = (betId) => {
    setBets(prevBets => prevBets.filter(bet => bet.id !== betId));
    alert('Aposta excluída com sucesso!');
  };

  const stats = useMemo(() => {
    const totalBets = bets.length;
    const greenBetsCount = bets.filter(bet => bet.status === 'won' || bet.result === 'green' || bet.result === 'Ganha').length;
    const redBetsCount = bets.filter(bet => bet.status === 'lost' || bet.result === 'red' || bet.result === 'Perdida').length;
    // Considerar apenas apostas com resultado 'won' ou 'lost' para o cálculo da taxa de acerto, 
    // excluindo 'void', 'cashed_out', 'pending', 'Devolvida', 'Cashout'
    const relevantBetsForWinRate = bets.filter(bet => 
        (bet.status === 'won' || bet.result === 'green' || bet.result === 'Ganha') || 
        (bet.status === 'lost' || bet.result === 'red' || bet.result === 'Perdida')
    ).length;

    const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const winRate = relevantBetsForWinRate > 0 ? (greenBetsCount / relevantBetsForWinRate * 100) : 0;
    
    const totalOddsSum = bets.reduce((sum, bet) => sum + (parseFloat(bet.odd) || 0), 0);
    const averageOdd = totalBets > 0 ? (totalOddsSum / totalBets) : 0;

    return {
      totalProfit: totalProfit,
      totalBets: totalBets,
      greenBets: greenBetsCount,
      redBets: redBetsCount, // Pode ser usado futuramente se necessário
      winRate: winRate,
      averageOdd: averageOdd
    };
  }, [bets]);

  const todayBetsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bets.filter(bet => bet.date === today).length;
  }, [bets]);

  const parseBet365HTML = (htmlString, selectedDateForImport) => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");
        const betElements = doc.querySelectorAll('.myb-SettledBetItem');
        const parsedBets = [];

        console.log("Total de elementos .myb-SettledBetItem encontrados:", betElements.length);

        betElements.forEach((item, index) => {
            console.log(`Processando item ${index + 1}`);

            const marketDescriptionEl = item.querySelector('.myb-BetParticipant_MarketDescription');
            const marketDescriptionText = marketDescriptionEl ? marketDescriptionEl.textContent.trim() : '';

            // Filtro: Apenas apostas de "Mercado de Minutos"
            if (!marketDescriptionText.toLowerCase().includes('minutos')) {
                console.log(`Item ${index + 1} ignorado: não é de mercado de minutos. Mercado: "${marketDescriptionText}"`);
                return; // Pula este item
            }
            console.log(`Item ${index + 1} é de mercado de minutos: "${marketDescriptionText}"`);

            let marketMinutes = "Não especificado";
            const subHeaderTextEl = item.querySelector('.myb-SettledBetItemHeader_SubHeaderText');
            if (subHeaderTextEl) {
                const subHeaderText = subHeaderTextEl.textContent.trim();
                const match = subHeaderText.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
                if (match && match[1]) {
                    marketMinutes = match[1].replace(/\s+/g, '');
                    console.log(`Item ${index + 1}: marketMinutes extraído de SubHeaderText: "${marketMinutes}"`);
                } else {
                     console.log(`Item ${index + 1}: marketMinutes NÃO encontrado em SubHeaderText: "${subHeaderText}"`);
                }
            } else {
                // Fallback se o SubHeaderText não for encontrado (improvável, mas para segurança)
                const participantSpanEl = item.querySelector('.myb-BetParticipant_ParticipantSpan');
                if (participantSpanEl) {
                    const participantSpanText = participantSpanEl.textContent.trim();
                    const match = participantSpanText.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
                    if (match && match[1]) {
                        marketMinutes = match[1].replace(/\s+/g, '');
                         console.log(`Item ${index + 1}: marketMinutes extraído de ParticipantSpan: "${marketMinutes}"`);
                    } else {
                        console.log(`Item ${index + 1}: marketMinutes NÃO encontrado em ParticipantSpan: "${participantSpanText}"`);
                    }
                } else {
                    console.log(`Item ${index + 1}: Elementos para marketMinutes não encontrados.`);
                }
            }


            const stakeEl = item.querySelector('.myb-SettledBetItemHeader_Text');
            const selectionEl = item.querySelector('.myb-SettledBetItemHeader_SubHeaderText'); // Usado para 'selection'
            const oddEl = item.querySelector('.myb-BetParticipant_HeaderOdds');

            // Seletores ATUALIZADOS para nomes dos times
            const team1NameEl = item.querySelector('.myb-BetParticipant_Team1Name');
            const team2NameEl = item.querySelector('.myb-BetParticipant_Team2Name');

            const winLossIndicator = item.querySelector('.myb-WinLossIndicator');
            // Seletor ATUALIZADO para valor de retorno
            const returnAmountEl = item.querySelector('.myb-SettledBetItemFooter_BetInformationText');


            const stakeText = stakeEl ? stakeEl.textContent.trim() : '0';
            let stakeValue = 0;
            const stakeMatch = stakeText.match(/[\d,.]+/);
            if (stakeMatch && stakeMatch[0]) {
                stakeValue = parseFloat(stakeMatch[0].replace(/\./g, '').replace(',', '.'));
            }
            console.log(`Item ${index + 1}: Stake: ${stakeValue} (texto original: "${stakeText}")`);


            const homeTeam = team1NameEl ? team1NameEl.textContent.trim() : "Time Casa não encontrado";
            const awayTeam = team2NameEl ? team2NameEl.textContent.trim() : "Time Visitante não encontrado";
            const selection = selectionEl ? selectionEl.textContent.trim() : "Seleção não encontrada";
            const oddText = oddEl ? oddEl.textContent.trim() : '0';
            const oddValue = parseFloat(oddText.replace(',', '.')) || 0; // odd pode ser 1.66 ou 1,66

            let status = 'pending';
            let profit = 0;
            let returnValue = 0;

            if (returnAmountEl) {
                const returnText = returnAmountEl.textContent.trim();
                const returnMatch = returnText.match(/[\d,.]+/);
                if (returnMatch && returnMatch[0]) {
                    returnValue = parseFloat(returnMatch[0].replace(/\./g, '').replace(',', '.'));
                }
            }
            console.log(`Item ${index + 1}: Retorno: ${returnValue}`);


            if (winLossIndicator) {
                if (winLossIndicator.classList.contains('myb-WinLossIndicator-won')) {
                    status = 'won';
                    profit = returnValue - stakeValue;
                } else if (winLossIndicator.classList.contains('myb-WinLossIndicator-lost')) {
                    status = 'lost';
                    profit = -stakeValue;
                } else if (winLossIndicator.classList.contains('myb-WinLossIndicator-void')) {
                    status = 'void';
                    profit = 0;
                } else if (winLossIndicator.classList.contains('myb-WinLossIndicator-cashout')) {
                    status = 'cashed_out';
                    // Para cashout, o profit é o valor retornado menos o stake.
                    // Se o valor retornado for menor que o stake, o profit pode ser negativo.
                    profit = returnValue - stakeValue;
                } else {
                    // Fallback para label (menos preciso)
                    const statusLabelEl = item.querySelector('.myb-SettledBetItem_BetStateLabel');
                    const statusText = statusLabelEl ? statusLabelEl.textContent.trim().toLowerCase() : '';
                    if (statusText.includes('ganha')) status = 'won';
                    else if (statusText.includes('perdida')) status = 'lost';
                    else if (statusText.includes('devolvida')) status = 'void';
                    else if (statusText.includes('encerrada')) status = 'cashed_out';

                    if (status === 'won' || status === 'cashed_out') {
                        profit = returnValue - stakeValue;
                    } else if (status === 'lost') {
                        profit = -stakeValue;
                    }
                }
            } else {
                 console.log(`Item ${index + 1}: WinLossIndicator não encontrado.`);
            }
            console.log(`Item ${index + 1}: Status: ${status}, Profit: ${profit}`);


            const bet = {
                id: `${selectedDateForImport}-${homeTeam}-${awayTeam}-${marketMinutes}-${selection}-${stakeValue}`.replace(/\s+/g, '-').toLowerCase(),
                date: selectedDateForImport,
                championship: "Não encontrado", // Ainda não implementado
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                market: marketDescriptionText, // Mercado completo, ex: "10 Minutos - Escanteios"
                marketMinutes: marketMinutes, // Intervalo de minutos, ex: "00:00-09:59"
                stake: stakeValue,
                odd: oddValue,
                status: status,
                profit: profit,
                selection: selection, // Descrição da seleção, ex: "00:00 - 09:59 Mais de 0.5"
            };
            
            // Validação básica
            if (stakeValue > 0 && oddValue > 0 && homeTeam !== "Time Casa não encontrado" && marketMinutes !== "Não especificado") {
                parsedBets.push(bet);
                console.log(`Item ${index + 1}: Aposta válida adicionada: `, bet);
            } else {
                console.log(`Item ${index + 1}: Aposta inválida ou incompleta, não adicionada. Stake: ${stakeValue}, Odd: ${oddValue}, Home: ${homeTeam}, MarketMinutes: ${marketMinutes}`);
            }
        });

        if (parsedBets.length === 0) {
            console.log("Nenhuma aposta válida de mercado de minutos foi encontrada no HTML fornecido.");
        } else {
            console.log(`Total de apostas de mercado de minutos parseadas: ${parsedBets.length}`);
        }
        return parsedBets;

    } catch (error) {
        console.error("Erro ao processar o HTML da Bet365:", error);
        return [];
    }
};

  const handleFileUpload = (file, selectedDateForImport) => {
    if (!selectedDateForImport) {
      alert("Por favor, selecione uma data para as apostas.");
      return;
    }
    if (file && file.type === "text/html") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const htmlString = e.target.result;
        try {
          const parsedBets = parseBet365HTML(htmlString, selectedDateForImport);
          if (parsedBets && parsedBets.length > 0) {
            setBets(prevBets => {
              const newBetsToAdd = parsedBets.filter(newBet => 
                !prevBets.some(existingBet => existingBet.id === newBet.id)
              );
              if (newBetsToAdd.length > 0) {
                alert(`${newBetsToAdd.length} novas apostas importadas com sucesso para ${selectedDateForImport}!`);
                return [...newBetsToAdd, ...prevBets];
              }
              alert("Nenhuma nova aposta encontrada no arquivo ou todas as apostas do arquivo já existem para esta data e evento.");
              return prevBets;
            });
          } else {
            // O alerta de "Nenhuma aposta válida" já é dado dentro de parseBet365HTML se parsedBets.length === 0
          }
        } catch (error) {
          console.error("Erro ao processar o arquivo HTML:", error);
          alert("Ocorreu um erro ao processar o arquivo HTML. Verifique o console para mais detalhes.");
        }
      };
      reader.onerror = (error) => {
        console.error("Erro ao ler o arquivo:", error);
        alert("Ocorreu um erro ao ler o arquivo.");
      };
      reader.readAsText(file);
    } else {
      alert("Por favor, selecione um arquivo HTML válido.");
    }
  };

  return (
    <div className="min-h-screen bg-green-700 text-gray-100">
      {/* Header APRIMORADO com Logo, Frase e Stats Cards */}
      <div className="bg-green-300 shadow-md border-b border-green-200 w-full">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-x-6">
            <div className="flex-shrink-0">
              <img src="/logo.png" alt="Corner System Logo" className="h-36" />
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatsCard title="Lucro Total" value={`R$ ${stats.totalProfit.toFixed(2).replace('.', ',')}`} icon={<TrendingUp size={22} />} color="text-yellow-400" textSize="text-sm" valueSize="text-xl" />
              <StatsCard title="Taxa de Acerto" value={`${stats.winRate.toFixed(1).replace('.', ',')}%`} icon={<BarChart3 size={22} />} color="text-yellow-400" textSize="text-sm" valueSize="text-xl" />
              <StatsCard title="Total de Apostas" value={stats.totalBets} icon={<Plus size={22} />} color="text-yellow-400" textSize="text-sm" valueSize="text-xl" />
              <StatsCard title="Odd Média" value={stats.averageOdd.toFixed(2).replace('.', ',')} icon={<Target size={22} />} color="text-yellow-400" textSize="text-sm" valueSize="text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-green-400 border-b border-green-300">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-green-700 hover:text-yellow-500'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reports'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-green-700 hover:text-yellow-500'
              }`}
            >
              Relatórios
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats}
            todayBetsCount={todayBetsCount}
            onShowAddForm={handleOpenAddForm}
            bets={bets}
            onFileUpload={handleFileUpload}
            onEditBet={handleEditBet}
            onDeleteBet={handleDeleteBet}
          />
        )}
        {activeTab === 'reports' && (
          <Reports 
            bets={bets} 
            timeIntervals={timeIntervals} 
            championships={championships} 
          />
        )}
      </div>

      {/* Add Form Modal */}
      <AddBetForm 
        show={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingBet(null);
        }}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        timeIntervals={timeIntervals}
        championships={championships}
        calculateProfit={calculateProfit}
        editingBet={editingBet}
      />

      {/* Footer */}
      <footer className="bg-blue-200 border-t border-blue-300 py-3 text-blue-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          {/* Informações do Desenvolvedor e Contatos à Esquerda */}
          <div className="text-left space-y-1 mb-2 md:mb-0">
            <p>Developed by: <span className="font-bold">Bruno Costa</span></p>
            <div className="flex items-center space-x-1 md:space-x-2 flex-wrap">
              <a href="mailto:costa_developer@gmail.com" className="flex items-center hover:text-yellow-500 whitespace-nowrap">
                <Mail size={14} className="mr-1 flex-shrink-0" /> costa_developer@gmail.com
              </a>
              <span className="text-blue-400 mx-1">/</span>
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-yellow-500 whitespace-nowrap">
                <Twitter size={14} className="mr-1 flex-shrink-0" /> @Costa_developer
              </a>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 flex-wrap mt-0.5">
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-yellow-500 whitespace-nowrap">
                <Instagram size={14} className="mr-1 flex-shrink-0" /> @Costa_developoer
              </a>
              <span className="text-blue-400 mx-1">/</span>
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-yellow-500 whitespace-nowrap">
                <Linkedin size={14} className="mr-1 flex-shrink-0" /> @Costa_developoer
              </a>
            </div>
          </div>

          {/* Frase Centralizada */}
          <div className="text-center">
            <p className="text-xl italic font-serif text-green-800">
              Em busca do <span className="text-2xl">Green</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BettingTracker; 