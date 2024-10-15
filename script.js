const sudokuBoard = document.getElementById('sudoku-board');
const startBtn = document.getElementById('startBtn');
const difficultySelect = document.getElementById('difficultySelect');
const mistakesCounter = document.getElementById('mistakesCounter');
const messageEl = document.getElementById('message');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const numberButtons = document.getElementById('numberButtons');
let initialBoard = [];
let solution = [];
let mistakesLeft;
let focusedInput = null; // Track currently focused input

// Function to check if placing a number is valid
function isValid(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) return false;
        if (board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] === num) return false;
    }
    return true;
}

// Function to solve the board using backtracking
function solveBoard(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveBoard(board)) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Function to generate a new Sudoku board based on difficulty level
function generateSudoku() {
    let board = Array.from({ length: 9 }, () => Array(9).fill(0));

    // Fill a few numbers randomly in the board
    for (let i = 0; i < 9; i++) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        let num = Math.floor(Math.random() * 9) + 1;
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
        }
    }

    solveBoard(board);
    solution = board.map(row => row.slice());

    // Define difficulty levels
    const difficulty = difficultySelect.value;
    let attempts;

    // Set number of blanks based on difficulty
    switch (difficulty) {
        case "easy":
            attempts = 15; // Remove fewer cells for easy puzzles
            break;
        case "medium":
            attempts = 40; // Moderate removal for medium puzzles
            break;
        case "hard":
            attempts = 60; // More removal for hard puzzles
            break;
    }

    // Create the puzzle by removing cells
    let puzzle = board.map(row => row.slice());
    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            attempts--;
        }
    }

    initialBoard = puzzle;
}

// Function to start or reset the game
function startGame() {
    generateSudoku(); 
    sudokuBoard.innerHTML = ''; 
    mistakesLeft = 3;
    mistakesCounter.textContent = `Mistakes Left: ${mistakesLeft}`;
    messageEl.textContent = '';
    tryAgainBtn.style.display = 'none'; // Hide the Try Again button
    difficultySelect.style.display = 'none'; // Hide difficulty selector when game starts
    numberButtons.style.display = 'block'; // Show number buttons after starting the game

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '9';
            input.value = initialBoard[i][j] !== 0 ? initialBoard[i][j] : '';
            input.disabled = initialBoard[i][j] !== 0;

            // Focus event to track the currently selected input
            input.addEventListener('focus', () => {
                focusedInput = input; // Set the focused input to the currently focused cell
            });

            input.addEventListener('input', () => {
                checkInput(i, j, input);
            });

            cell.appendChild(input);
            sudokuBoard.appendChild(cell);
        }
    }
}

// Function to check if input is valid
function checkInput(row, col, input) {
    const value = parseInt(input.value);
    if (value !== solution[row][col]) {
        input.classList.add('invalid');
        mistakesLeft--;
        mistakesCounter.textContent = `Mistakes Left: ${mistakesLeft}`;
        
        if (mistakesLeft <= 0) {
            endGame();
        }
    } else {
        input.classList.remove('invalid');
        checkGameCompletion(); // Check for game completion
    }
}

// Function to check if the game is completed
function checkGameCompletion() {
    const inputs = document.querySelectorAll('.cell input');
    const allFilledCorrectly = Array.from(inputs).every((input, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        return input.value == solution[row][col];
    });

    if (allFilledCorrectly) {
        messageEl.textContent = "Congratulations! You've completed the game!";
        const inputs = document.querySelectorAll('.cell input');
        inputs.forEach(input => {
            input.disabled = true; // Disable all inputs
        });
        tryAgainBtn.style.display = 'block'; // Show the Try Again button
        startBtn.style.display = 'none'; // Hide Start Game button
        difficultySelect.style.display = 'none'; // Hide difficulty selector
        numberButtons.style.display = 'none'; // Hide number buttons
    }
}

// Function to end the game
function endGame() {
    messageEl.textContent = "Game Over! You've made too many mistakes.";
    const inputs = document.querySelectorAll('.cell input');
    inputs.forEach(input => {
        input.disabled = true; // Disable all inputs
    });
    tryAgainBtn.style.display = 'block'; // Show the Try Again button
    startBtn.style.display = 'none'; // Hide Start Game button
    difficultySelect.style.display = 'none'; // Hide difficulty selector
    numberButtons.style.display = 'none'; // Hide number buttons
}

// Event listener for number buttons
document.querySelectorAll('.num-btn').forEach(button => {
    button.addEventListener('click', () => {
        const value = button.getAttribute('data-value');
        if (focusedInput) { // Check if there's a focused input
            focusedInput.value = value; // Set the value of the focused input
            const rowIndex = Math.floor(Array.from(sudokuBoard.children).indexOf(focusedInput.parentElement) / 9);
            const colIndex = Array.from(sudokuBoard.children).indexOf(focusedInput.parentElement) % 9;
            checkInput(rowIndex, colIndex, focusedInput);
        }
    });
});

// Event Listeners
startBtn.addEventListener('click', startGame);
tryAgainBtn.addEventListener('click', startGame);
