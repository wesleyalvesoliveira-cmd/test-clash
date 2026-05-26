// ==========================================
// BANCO DE DADOS DAS CARTAS DO JOGO
// ==========================================
const cardDatabase = [
    { name: "Venda Clássica", cost: 2, type: "Restrição", power: 10, log: "Você colocou uma venda. A antecipação aumentou o controle!" },
    { name: "Sussurro", cost: 3, type: "Provocação", power: 15, log: "Você sussurrou ordens no ouvido do parceiro, quebrando resistências." },
    { name: "Palmatória Leve", cost: 4, type: "Impacto", power: 22, log: "Impacto leve! O ritmo da sessão acelerou drasticamente." },
    { name: "Amarras de Fita", cost: 3, type: "Restrição", power: 14, log: "Mãos presas com fitas de cetim. O controle é todo seu." },
    { name: "Elogio Firme", cost: 2, type: "Afeto", power: 8, log: "Um elogio na hora certa reconforta e abre espaço para mais intensidade." },
    { name: "Olhar Dominante", cost: 1, type: "Mental", power: 5, log: "Contato visual intenso estabelecido. Foco mantido." }
];

// ==========================================
// ESTADO DO JOGO (VARIÁVEIS DE CONTROLE)
// ==========================================
let currentFocus = 0;
const maxFocus = 10;
let controlLevel = 50; // Começa equilibrado em 50%
let oppResistance = 100;
let currentHand = [];
let gameInterval;
let aiInterval;

// ==========================================
// FUNÇÕES PRINCIPAIS
// ==========================================

// Inicializa ou reabastece a mão do jogador com 4 cartas sem repetir opções idênticas na sequência
function refillHand() {
    const handElement = document.getElementById('player-hand');
    if (!handElement) return;
    
    handElement.innerHTML = '';
    
    // Mantém a mão sempre com 4 cartas
    while (currentHand.length < 4) {
        const randomCard = cardDatabase[Math.floor(Math.random() * cardDatabase.length)];
        currentHand.push({ ...randomCard });
    }

    // Renderiza as cartas visualmente na tela
    currentHand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        // Se o jogador não tiver Foco suficiente, a carta aparece desativada
        cardDiv.className = `card ${currentFocus < card.cost ? 'disabled' : ''}`;
        cardDiv.setAttribute('data-index', index);
        cardDiv.onclick = () => playCard(index);

        cardDiv.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-title">${card.name}</div>
            <div class="card-type">${card.type}</div>
        `;
        handElement.appendChild(cardDiv);
    });
}

// Atualiza a interface gráfica (recursos, texto de log e barras)
function updateUI() {
    // 1. Atualiza a Barra de Foco (Elixir)
    const focusPercent = (currentFocus / maxFocus) * 100;
    document.getElementById('focus-bar').style.width = `${focusPercent}%`;
    document.getElementById('focus-text').innerText = `${Math.floor(currentFocus)} / ${maxFocus} FOCO`;

    // 2. Atualiza a Barra de Controle e Resistência
    document.getElementById('control-bar').style.width = `${controlLevel}%`;
    document.getElementById('opp-resistance').innerText = Math.max(0, Math.floor(oppResistance));

    // 3. Atualiza o estado visual de clique das cartas
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach(cardEl => {
        const idx = cardEl.getAttribute('data-index');
        if (currentHand[idx] && currentFocus < currentHand[idx].cost) {
            cardEl.classList.add('disabled');
        } else {
            cardEl.classList.remove('disabled');
        }
    });

    checkWinCondition();
}

// Executa a ação de jogar uma carta
function playCard(index) {
    const card = currentHand[index];
    
    // Verifica se há foco/elixir suficiente
    if (currentFocus >= card.cost) {
        currentFocus -= card.cost;
        
        // Aplica os efeitos na dinâmica do jogo
        controlLevel += card.power * 0.6;
        oppResistance -= card.power * 0.8;
        
        if (controlLevel > 100) controlLevel = 100;

        // Atualiza o histórico de texto
        document.getElementById('action-log').innerText = card.log;

        // Remove a carta usada e puxa uma nova do deck
        currentHand.splice(index, 1);
        refillHand();
        updateUI();
    }
}

// Loops de tempo real (Regeneração de Foco e resistência da IA)
function startGameLoops() {
    // Regeneração passiva de Foco (Simulando o Elixir do Clash Royale)
    gameInterval = setInterval(() => {
        if (currentFocus < maxFocus) {
            currentFocus += 0.2; // Aumenta gradualmente
            if (currentFocus > maxFocus) currentFocus = maxFocus;
            updateUI();
        }
    }, 200);

    // Reação passiva do parceiro (IA puxando o controle de volta com o tempo)
    aiInterval = setInterval(() => {
        if (controlLevel > 30) {
            controlLevel -= 1.5;
            updateUI();
        }
    }, 1200);
}

// Verifica se o objetivo da sessão foi atingido
function checkWinCondition() {
    if (controlLevel >= 100 || oppResistance <= 0) {
        endGame("Sessão Concluída", "Você alcançou a sincronia perfeita e o ápice do controle com o seu parceiro em total consentimento. Hora do Aftercare! ❤️");
    }
}

// Finaliza a partida e exibe a tela de overlay
function endGame(title, description) {
    clearInterval(gameInterval);
    clearInterval(aiInterval);
    document.getElementById('end-title').innerText = title;
    document.getElementById('end-desc').innerText = description;
    document.getElementById('end-overlay').style.display = 'flex';
}

// Mecânica de Segurança Avançada: Parada Imediata
function triggerSafeWord() {
    endGame("Safe Word Ativada", "A sessão foi interrompida imediatamente por segurança (Botão Vermelho). O jogo foi pausado para garantir o conforto e acolhimento de todos.");
    document.getElementById('end-title').style.color = "#ff0000";
}

// Reinicia todos os parâmetros para uma nova rodada
function resetGame() {
    currentFocus = 0;
    controlLevel = 50;
    oppResistance = 100;
    currentHand = [];
    document.getElementById('end-overlay').style.display = 'none';
    document.getElementById('end-title').style.color = "#ff0055";
    document.getElementById('action-log').innerText = "Nova sessão iniciada com segurança.";
    refillHand();
    startGameLoops();
}

// ==========================================
// INICIALIZAÇÃO AUTOMÁTICA DO JOGO
// ==========================================
window.onload = () => {
    refillHand();
    startGameLoops();
};