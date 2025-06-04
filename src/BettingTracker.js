import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, TrendingUp, BarChart3, Target, Instagram, Linkedin, Mail, Twitter } from 'lucide-react';
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
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState({ type: '', message: '' });
  
  // Envolver initialFormData em useMemo
  const initialFormData = useMemo(() => ({
    date: new Date().toISOString().split('T')[0],
    championship: '',
    homeTeam: '',
    awayTeam: '',
    marketMinutes: '',
    odd: '',
    result: '',
    stake: 100
  }), []);

  const [formData, setFormData] = useState(initialFormData);

  const timeIntervals = useMemo(() => [
    '0-9:59', '10-19:59', '20-29:59', '30-39:59', '40-49:59',
    '50-59:59', '60-69:59', '70-79:59', '80-fim'
  ], []);

  // Criar lista dinâmica de campeonatos únicos
  const uniqueChampionships = useMemo(() => {
    const allChampionships = bets.map(bet => bet.championship).filter(Boolean); // filter(Boolean) remove valores nulos ou vazios
    return Array.from(new Set(allChampionships)).sort(); // Ordena para melhor visualização
  }, [bets]);

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

  const parseBet365HTML = async (htmlString, selectedDateForImport) => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");
        const betElements = doc.querySelectorAll('.myb-SettledBetItem');
        // Usaremos um array para Promises se precisarmos de processamento em paralelo no futuro
        const parsedBetsPromises = []; 

        console.log("Total de elementos .myb-SettledBetItem encontrados:", betElements.length);

        // Iterar sobre os elementos de aposta
        for (let i = 0; i < betElements.length; i++) {
            const item = betElements[i];
            console.log(`Processando item ${i + 1}`);

            const marketDescriptionEl = item.querySelector('.myb-BetParticipant_MarketDescription');
            const marketDescriptionText = marketDescriptionEl ? marketDescriptionEl.textContent.trim() : '';

            if (!marketDescriptionText.toLowerCase().includes('minutos')) {
                console.log(`Item ${i + 1} ignorado: não é de mercado de minutos. Mercado: "${marketDescriptionText}"`);
                continue; 
            }
            console.log(`Item ${i + 1} é de mercado de minutos: "${marketDescriptionText}"`);

            let marketMinutes = "Não especificado";
            const subHeaderTextEl = item.querySelector('.myb-SettledBetItemHeader_SubHeaderText');
            if (subHeaderTextEl) {
                const subHeaderText = subHeaderTextEl.textContent.trim();
                const matchMinute = subHeaderText.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
                if (matchMinute && matchMinute[1]) {
                    marketMinutes = matchMinute[1].replace(/\s+/g, '');
                }
            } else {
                const participantSpanEl = item.querySelector('.myb-BetParticipant_ParticipantSpan');
                if (participantSpanEl) {
                    const participantSpanText = participantSpanEl.textContent.trim();
                    const matchMinute = participantSpanText.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
                    if (matchMinute && matchMinute[1]) {
                        marketMinutes = matchMinute[1].replace(/\s+/g, '');
                    }
                }
            }

            const stakeEl = item.querySelector('.myb-SettledBetItemHeader_Text');
            const selectionEl = item.querySelector('.myb-SettledBetItemHeader_SubHeaderText');
            const oddEl = item.querySelector('.myb-BetParticipant_HeaderOdds');
            const team1NameEl = item.querySelector('.myb-BetParticipant_Team1Name');
            const team2NameEl = item.querySelector('.myb-BetParticipant_Team2Name');
            const winLossIndicator = item.querySelector('.myb-WinLossIndicator');
            const returnAmountEl = item.querySelector('.myb-SettledBetItemFooter_BetInformationText');

            const stakeText = stakeEl ? stakeEl.textContent.trim() : '0';
            let stakeValue = 0;
            const stakeMatch = stakeText.match(/[\d,.]+/);
            if (stakeMatch && stakeMatch[0]) {
                stakeValue = parseFloat(stakeMatch[0].replace(/\./g, '').replace(',', '.'));
            }

            const homeTeam = team1NameEl ? team1NameEl.textContent.trim() : "Time Casa não encontrado";
            const awayTeam = team2NameEl ? team2NameEl.textContent.trim() : "Time Visitante não encontrado";
            const selection = selectionEl ? selectionEl.textContent.trim() : "Seleção não encontrada";
            const oddText = oddEl ? oddEl.textContent.trim() : '0';
            const oddValue = parseFloat(oddText.replace(',', '.')) || 0;

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
                    profit = returnValue - stakeValue;
                } else {
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
            }
            
            let championship = "Aguardando busca..."; // Placeholder inicial

            if (homeTeam !== "Time Casa não encontrado" && awayTeam !== "Time Visitante não encontrado" && selectedDateForImport) {
                const searchQuery = `${homeTeam} vs ${awayTeam} campeonato ${selectedDateForImport} site:sofascore.com`;
                console.log(`Item ${i + 1}: Query de busca (simulada) para Google Search API: "${searchQuery}"`);
                
                // SIMULAÇÃO REFINADA:
                // Em um cenário real, seu frontend chamaria um endpoint do seu backend aqui.
                // Seu backend faria a chamada para a Google Search API com a searchQuery.
                // E então seu backend processaria os resultados para extrair o campeonato, priorizando sofascore.com.

                // Exemplo de como você poderia chamar seu backend (requer implementação do backend):
                // try {
                //   const response = await fetch(`/api/search-championship?q=${encodeURIComponent(searchQuery)}`);
                //   if (response.ok) {
                //     const data = await response.json();
                //     championship = data.championship || "Não encontrado via API (Simulado)";
                //   } else {
                //     championship = "Erro na API (Simulado)";
                //   }
                // } catch (error) {
                //   console.error("Erro ao chamar API de busca simulada:", error);
                //   championship = "Falha na conexão API (Simulado)";
                // }

                // Simulação atual para demonstração do fluxo:
                if (homeTeam.toLowerCase().includes("flamengo") || awayTeam.toLowerCase().includes("flamengo")) {
                    championship = "Brasileirão Série A (Sofascore Simulado)";
                } else if (homeTeam.toLowerCase().includes("real madrid") || awayTeam.toLowerCase().includes("real madrid")) {
                    championship = "La Liga (Sofascore Simulado)";
                } else if (homeTeam.toLowerCase().includes("manchester city") || awayTeam.toLowerCase().includes("manchester city")) {
                    championship = "Premier League (Sofascore Simulado)";
                } else {
                    championship = "Campeonato Genérico (Sofascore Simulado)";
                }
                console.log(`Item ${i + 1}: Campeonato (simulado) após busca: "${championship}"`);
            }

            const bet = {
                id: `${selectedDateForImport}-${homeTeam}-${awayTeam}-${marketMinutes}-${selection}-${stakeValue}`.replace(/\s+/g, '-').toLowerCase(),
                date: selectedDateForImport,
                championship: championship, // Usar o campeonato encontrado
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                market: marketDescriptionText,
                marketMinutes: marketMinutes,
                stake: stakeValue,
                odd: oddValue,
                status: status,
                profit: profit,
                selection: selection,
            };
            
            if (stakeValue > 0 && oddValue > 0 && homeTeam !== "Time Casa não encontrado" && marketMinutes !== "Não especificado") {
                // Em vez de adicionar diretamente, adicionamos a promessa de processar esta aposta
                // (neste caso, a "promessa" é o próprio objeto bet, já que a busca simulada é síncrona)
                // Se a busca fosse realmente async, aqui adicionaríamos a Promise retornada pela busca.
                parsedBetsPromises.push(Promise.resolve(bet)); // Envolvemos em Promise.resolve para manter a estrutura
                console.log(`Item ${i + 1}: Aposta válida adicionada à lista de promessas: `, bet);
            } else {
                console.log(`Item ${i + 1}: Aposta inválida ou incompleta, não adicionada. Stake: ${stakeValue}, Odd: ${oddValue}, Home: ${homeTeam}, MarketMinutes: ${marketMinutes}`);
            }
        } // Fim do loop for

        // Esperar todas as "promessas" (buscas de campeonato) serem resolvidas
        const parsedBets = await Promise.all(parsedBetsPromises);

        if (parsedBets.length === 0) {
            console.log("Nenhuma aposta válida de mercado de minutos foi encontrada no HTML fornecido ou processada.");
            alert("Nenhuma aposta válida de mercado de minutos foi encontrada no arquivo HTML.");
        } else {
            console.log(`Total de apostas de mercado de minutos processadas: ${parsedBets.length}`);
        }
        return parsedBets;

    } catch (error) {
        console.error("Erro ao processar o HTML da Bet365:", error);
        alert("Erro ao processar o HTML. Verifique o console para detalhes.");
        return [];
    }
};

  // Envolver clearImportFeedback em useCallback
  const clearImportFeedback = useCallback(() => {
    setImportFeedback({ type: '', message: '' });
  }, [setImportFeedback]); // setImportFeedback é estável, mas é bom listá-lo como boa prática

  const handleDeleteBetsByDate = useCallback((dateToDelete) => {
    if (!dateToDelete) {
      setImportFeedback({ type: 'error', message: 'Nenhuma data selecionada para exclusão.' });
      return;
    }

    const confirmDelete = window.confirm(`Tem certeza que deseja excluir TODAS as apostas do dia ${new Date(dateToDelete + 'T00:00:00').toLocaleDateString('pt-BR')}? Esta ação não pode ser desfeita.`);

    if (confirmDelete) {
      const actualDeletedCount = bets.filter(bet => bet.date === dateToDelete).length;
      setBets(prevBets => prevBets.filter(bet => bet.date !== dateToDelete));

      if (actualDeletedCount > 0) {
        setImportFeedback({ type: 'success', message: `${actualDeletedCount} aposta(s) do dia ${new Date(dateToDelete + 'T00:00:00').toLocaleDateString('pt-BR')} foram excluídas.` });
      } else {
        setImportFeedback({ type: 'info', message: `Nenhuma aposta encontrada para o dia ${new Date(dateToDelete + 'T00:00:00').toLocaleDateString('pt-BR')} para excluir.` });
      }
    } else {
      setImportFeedback({ type: 'info', message: 'Exclusão de apostas cancelada.' });
    }
  }, [bets, setBets, setImportFeedback]);

  const handleFileUpload = async (file, selectedDateForImport) => {
    clearImportFeedback(); // Agora clearImportFeedback tem referência estável
    if (!selectedDateForImport) {
      // alert("Por favor, selecione uma data para as apostas.");
      setImportFeedback({ type: 'error', message: 'Por favor, selecione uma data para as apostas.' });
      return;
    }
    if (!file || file.type !== "text/html") {
      // alert("Por favor, selecione um arquivo HTML válido.");
      setImportFeedback({ type: 'error', message: 'Por favor, selecione um arquivo HTML válido.' });
      return;
    }

    setIsImporting(true);
    // const reader = new FileReader(); // Movido para dentro de uma nova Promise para melhor controle

    try {
      const htmlString = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });

      const parsedBets = await parseBet365HTML(htmlString, selectedDateForImport);
      
      if (parsedBets && parsedBets.length > 0) {
        setBets(prevBets => {
          const newBetsToAdd = parsedBets.filter(newBet => 
            !prevBets.some(existingBet => existingBet.id === newBet.id)
          );
          if (newBetsToAdd.length > 0) {
            // alert(`${newBetsToAdd.length} novas apostas importadas com sucesso para ${selectedDateForImport}!`);
            setImportFeedback({ type: 'success', message: `${newBetsToAdd.length} novas apostas importadas com sucesso para ${selectedDateForImport}!` });
            return [...newBetsToAdd, ...prevBets];
          }
          // alert("Nenhuma nova aposta encontrada no arquivo ou todas as apostas do arquivo já existem para esta data e evento.");
          setImportFeedback({ type: 'info', message: 'Nenhuma nova aposta encontrada no arquivo ou todas as apostas do arquivo já existem.' });
          return prevBets;
        });
      } else {
        // Se parseBet365HTML já deu um alert sobre "Nenhuma aposta válida", 
        // podemos não precisar de outro feedback aqui, ou podemos centralizar.
        // Por ora, se parsedBets for vazio e não houve erro, é provável que parseBet365HTML já tenha alertado.
        // No entanto, para o novo sistema de feedback, vamos garantir uma mensagem.
        if (!importFeedback.message) { // Só define se nenhuma outra mensagem (de erro no parse) foi definida
            setImportFeedback({ type: 'info', message: 'Nenhuma aposta válida de mercado de minutos encontrada no arquivo.' });
        }
      }
    } catch (error) {
      console.error("Erro em handleFileUpload:", error);
      // alert("Ocorreu um erro ao processar o arquivo. Verifique o console para mais detalhes.");
      setImportFeedback({ type: 'error', message: `Erro ao processar o arquivo: ${error.message || 'Erro desconhecido.'}` });
    }
    finally {
      setIsImporting(false);
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
            isImporting={isImporting}
            importFeedback={importFeedback}
            clearImportFeedback={clearImportFeedback}
            onDeleteBetsByDate={handleDeleteBetsByDate}
          />
        )}
        {activeTab === 'reports' && (
          <Reports 
            bets={bets} 
            timeIntervals={timeIntervals} 
            championships={uniqueChampionships} 
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
        championships={uniqueChampionships}
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
              <a href="#!" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-yellow-500 whitespace-nowrap">
                <Twitter size={14} className="mr-1 flex-shrink-0" /> @Costa_developer
              </a>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 flex-wrap mt-0.5">
              <a href="#!" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-yellow-500 whitespace-nowrap">
                <Instagram size={14} className="mr-1 flex-shrink-0" /> @Costa_developoer
              </a>
              <span className="text-blue-400 mx-1">/</span>
              <a href="#!" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-yellow-500 whitespace-nowrap">
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