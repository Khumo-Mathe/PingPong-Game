// Resize canvas to fit the viewport
function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.9; // 90% of viewport width
    const maxHeight = window.innerHeight * 0.7; // 70% of viewport height

    // Maintain aspect ratio (800x600)
    const aspectRatio = 800 / 600;
    let newWidth = maxWidth;
    let newHeight = maxWidth / aspectRatio;

    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = maxHeight * aspectRatio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
}

// Resize canvas on page load and window resize
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
const paddleWidth = 10, paddleHeight = 100;
const ballSize = 10;
let player1Score = 0, player2Score = 0;
let highScore = 0;
let gameRunning = false;
let gamePaused = false;
let aiMode = false; // Tracks if AI mode is active

// Paddle positions
let player1Y = canvas.height / 2 - paddleHeight / 2;
let player2Y = canvas.height / 2 - paddleHeight / 2;

// Ball position and speed
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 5, ballSpeedY = 5;

// Player controls
const paddleSpeed = 8;
let upArrowPressed = false;
let downArrowPressed = false;
let wKeyPressed = false;
let sKeyPressed = false;

// DOM Elements
const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const aiBtn = document.getElementById("aiBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const player1ScoreDisplay = document.getElementById("player1Score");
const player2ScoreDisplay = document.getElementById("player2Score");
const highScoreDisplay = document.getElementById("highScore");

// Event listeners for key presses
document.addEventListener("keydown", (e) => {
    // Prevent default behavior for arrow keys and game controls
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === "ArrowUp") upArrowPressed = true;
    if (e.key === "ArrowDown") downArrowPressed = true;
    if (e.key === "w") wKeyPressed = true;
    if (e.key === "s") sKeyPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") upArrowPressed = false;
    if (e.key === "ArrowDown") downArrowPressed = false;
    if (e.key === "w") wKeyPressed = false;
    if (e.key === "s") sKeyPressed = false;
});

// Button event listeners
twoPlayerBtn.addEventListener("click", () => setMode(false));
aiBtn.addEventListener("click", () => setMode(true));
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
stopBtn.addEventListener("click", stopGame);

// Set game mode (AI or Two Players)
function setMode(isAIMode) {
    aiMode = isAIMode;
    twoPlayerBtn.disabled = isAIMode;
    aiBtn.disabled = !isAIMode;
    resetGame();
}

// Start the game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        resetGame();
        gameLoop();
    }
}

// Pause the game
function pauseGame() {
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? "Resume Game" : "Pause Game";
}

// Stop the game
function stopGame() {
    gameRunning = false;
    gamePaused = false;
    resetGame();
    pauseBtn.textContent = "Pause Game";
}

// Reset the game
function resetGame() {
    player1Score = 0;
    player2Score = 0;
    player1ScoreDisplay.textContent = "0";
    player2ScoreDisplay.textContent = "0";
    resetBall();
}

// Reset ball to center
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX; // Alternate direction
}

// Draw a rectangle (used for paddles and ball)
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Draw the ball
function drawBall(x, y, size, color) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

// Draw the score
function drawScore() {
    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;
    highScoreDisplay.textContent = Math.max(player1Score, player2Score, highScore);
}

// AI logic for controlling the left paddle
function moveAI() {
    if (ballY > player1Y + paddleHeight / 2) {
        player1Y += paddleSpeed;
    } else if (ballY < player1Y + paddleHeight / 2) {
        player1Y -= paddleSpeed;
    }

    // Ensure the AI paddle stays within bounds
    if (player1Y < 0) player1Y = 0;
    if (player1Y + paddleHeight > canvas.height) player1Y = canvas.height - paddleHeight;
}

// Update game state
function update() {
    if (!gameRunning || gamePaused) return;

    // Move player 1 paddle (left paddle)
    if (!aiMode) {
        if (wKeyPressed && player1Y > 0) {
            player1Y -= paddleSpeed;
        }
        if (sKeyPressed && player1Y + paddleHeight < canvas.height) {
            player1Y += paddleSpeed;
        }
    } else {
        moveAI(); // AI controls the left paddle
    }

    // Move player 2 paddle (right paddle)
    if (upArrowPressed && player2Y > 0) {
        player2Y -= paddleSpeed;
    }
    if (downArrowPressed && player2Y + paddleHeight < canvas.height) {
        player2Y += paddleSpeed;
    }

    // Move the ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top and bottom walls
    if (ballY - ballSize < 0 || ballY + ballSize > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    // Ball collision with paddles
    if (
        (ballX - ballSize < paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) || // Player 1 paddle
        (ballX + ballSize > canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) // Player 2 paddle
    ) {
        ballSpeedX = -ballSpeedX;
    }

    // Ball out of bounds (score)
    if (ballX - ballSize < 0) {
        player2Score++;
        resetBall();
    }
    if (ballX + ballSize > canvas.width) {
        player1Score++;
        resetBall();
    }

    // Update high score
    highScore = Math.max(player1Score, player2Score, highScore);
}

// Render the game
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    drawRect(0, player1Y, paddleWidth, paddleHeight, "#fff"); // Player 1 (left)
    drawRect(canvas.width - paddleWidth, player2Y, paddleWidth, paddleHeight, "#fff"); // Player 2 (right)

    // Draw ball
    drawBall(ballX, ballY, ballSize, "#fff");

    // Draw score
    drawScore();
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}