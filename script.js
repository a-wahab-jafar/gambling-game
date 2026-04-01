
// Game State Object
const gameState = {
    playerName: '',
    balance: 1000,
    totalWins: 0,
    totalLosses: 0,
    currentGuess: null,
    currentBet: null,
    randomNumber: null,
    isWin: false,
    history: [] // Array to store all rounds
};

// SECTION NAVIGATION FUNCTIONS

/* Hide all sections and show the specified one */

function showSection(sectionName) {
    hideAllSections();
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.remove('hidden');
    }
}

/* Hide all sections*/
function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
}


/* Start the game by showing registration section and scrolling to it */
function startGame() {
    showSection('registrationSection');
    document.getElementById('registrationSection').scrollIntoView({ behavior: 'smooth' });
}

/* Process player registration and move to game section */
function proceedToPlay(event) {
    event.preventDefault();

    const nameInput = document.getElementById('playerName');
    const balanceInput = document.getElementById('startingBalance');

    const playerName = nameInput.value.trim();
    const startingBalance = parseInt(balanceInput.value) || 1000;

    // Validation
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }

    if (startingBalance < 1) {
        alert('Starting balance must be at least $1!');
        return;
    }

    // Store player info in game state
    gameState.playerName = playerName;
    gameState.balance = startingBalance;
    gameState.totalWins = 0;
    gameState.totalLosses = 0;
    gameState.history = [];

    // Update UI and show game section
    updateGameDisplay();
    showSection('gameSection');
}

/* Generate a random number between 1 and 10 */
function generateRandomNumber() {
    return Math.floor(Math.random() * 10) + 1;
}

/* Process betting and game play */
function playNow(event) {
    event.preventDefault();

    const betInput = document.getElementById('betAmount');
    const guessInput = document.getElementById('guessNumber');

    const bet = parseInt(betInput.value);
    const guess = parseInt(guessInput.value);

    // Validation
    if (!bet || bet <= 0) {
        alert('Bet amount must be greater than 0!');
        return;
    }

    if (bet > gameState.balance) {
        alert(`You cannot bet more than your balance ($${gameState.balance})!`);
        return;
    }

    if (!guess || guess < 1 || guess > 10) {
        alert('Please guess a number between 1 and 10!');
        return;
    }

    // Store current bet and guess
    gameState.currentBet = bet;
    gameState.currentGuess = guess;

    // Generate random number
    gameState.randomNumber = generateRandomNumber();

    // Determine winner
    determineWinnerAndProcess();

    // Show results
    showSection('resultsSection');
    displayResults();

    // Clear form
    betInput.value = '';
    guessInput.value = '';
}

/* Determine if player won and update balance*/
function determineWinnerAndProcess() {
    const playerGuess = gameState.currentGuess;
    const randomNum = gameState.randomNumber;
    const bet = gameState.currentBet;

    // Check if win
    if (playerGuess === randomNum) {
        gameState.isWin = true;
        gameState.balance += bet; // Add winnings
        gameState.totalWins++;
    } else {
        gameState.isWin = false;
        gameState.balance -= bet; // Deduct bet
        gameState.totalLosses++;
    }

    if (gameState.balance < 0) {
        gameState.balance = 0;
    }

    // Record this round in history
    recordRound();
}

/* Record the round in history array */
function recordRound() {
    const roundData = {
        round: gameState.history.length + 1,
        guess: gameState.currentGuess,
        randomNumber: gameState.randomNumber,
        bet: gameState.currentBet,
        result: gameState.isWin ? 'WIN' : 'LOSE',
        balanceAfter: gameState.balance,
        timestamp: new Date().toLocaleTimeString()
    };

    gameState.history.push(roundData);
}

/* Display results of the current round */
function displayResults() {
    const container = document.getElementById('resultsContainer');
    const messageClass = gameState.isWin ? 'win-message' : 'lose-message';
    const messageText = gameState.isWin ? '🎉 YOU WON! 🎉' : '😢 YOU LOST!';
    const winningText = gameState.isWin
        ? `You guessed correctly and won $${gameState.currentBet}!`
        : `Your guess didn't match. You lost $${gameState.currentBet}.`;

    let html = `
        <div class="result-row">
            <div class="result-item">
                <div class="result-label">Your Guess</div>
                <div class="result-value">${gameState.currentGuess}</div>
            </div>
            <div class="result-item">
                <div class="result-label">System Number</div>
                <div class="result-value">${gameState.randomNumber}</div>
            </div>
        </div>

        <div class="result-row">
            <div class="result-item">
                <div class="result-label">Bet Amount</div>
                <div class="result-value">$${gameState.currentBet}</div>
            </div>
            <div class="result-item">
                <div class="result-label">Total Wins</div>
                <div class="result-value">${gameState.totalWins}</div>
            </div>
        </div>

        <div class="result-message ${messageClass}">
            ${messageText}
        </div>

        <p style="text-align: center; color: var(--text-secondary); margin-bottom: 20px;">
            ${winningText}
        </p>

        <div class="updated-balance">
            <div class="label">Updated Balance</div>
            <div class="value">$${gameState.balance}</div>
        </div>
    `;

    container.innerHTML = html;
}

/* Play another round */
function playAgain() {
    updateGameDisplay();
    showSection('gameSection');
    document.getElementById('bettingForm').reset();
}

/* Show dashboard */
function showDashboard() {
    updateDashboard();
    showSection('dashboardSection');
}

/* Update dashboard with current stats and history */
function updateDashboard() {
    // Update stats
    document.getElementById('dashboardBalance').textContent = `$${gameState.balance}`;
    document.getElementById('dashboardWins').textContent = gameState.totalWins;
    document.getElementById('dashboardLosses').textContent = gameState.totalLosses;

    // Calculate win rate
    const totalRounds = gameState.totalWins + gameState.totalLosses;
    const winRate = totalRounds > 0 ? Math.round((gameState.totalWins / totalRounds) * 100) : 0;
    document.getElementById('dashboardWinRate').textContent = `${winRate}%`;

    // Display history
    displayHistory();
}

/* Display history table from history array */
function displayHistory() {
    const tbody = document.getElementById('historyTableBody');
    const emptyMessage = document.getElementById('emptyHistoryMessage');
    const table = document.getElementById('historyTable');

    if (gameState.history.length === 0) {
        tbody.innerHTML = '';
        table.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    emptyMessage.style.display = 'none';

    let html = '';
    for (let i = 0; i < gameState.history.length; i++) {
        const round = gameState.history[i];
        const resultClass = round.result === 'WIN' ? 'win' : 'lose';

        html += `
            <tr>
                <td>#${round.round}</td>
                <td>${round.guess}</td>
                <td>${round.randomNumber}</td>
                <td>$${round.bet}</td>
                <td class="result-cell ${resultClass}">${round.result}</td>
                <td>$${round.balanceAfter}</td>
            </tr>
        `;
    }

    tbody.innerHTML = html;
}

/* Confirm reset and reset game */
function confirmReset() {
    if (confirm('Are you sure you want to reset the game? All data will be lost.')) {
        resetGame();
    }
}

/* Reset the entire game*/
function resetGame() {
    // Reset game state
    gameState.playerName = '';
    gameState.balance = 1000;
    gameState.totalWins = 0;
    gameState.totalLosses = 0;
    gameState.currentGuess = null;
    gameState.currentBet = null;
    gameState.randomNumber = null;
    gameState.isWin = false;
    gameState.history = [];

    document.getElementById('registrationForm').reset();
    document.getElementById('bettingForm').reset();


    showSection('homeSection');
}

/* Update game section display with current player info */
function updateGameDisplay() {
    document.getElementById('currentPlayerName').textContent = gameState.playerName;
    document.getElementById('currentBalance').textContent = `$${gameState.balance}`;
}

/* Update balance display in game section after round */
function updateBalanceDisplay() {
    document.getElementById('currentBalance').textContent = `$${gameState.balance}`;
}

// INITIALIZE ON PAGE LOAD


document.addEventListener('DOMContentLoaded', () => {
    // Show home section by default
    showSection('homeSection');
});
