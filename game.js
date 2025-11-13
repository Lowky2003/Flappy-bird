// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let frames = 0;
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let gameState = 'start'; // start, playing, gameOver

// Bird object
const bird = {
    x: 80,
    y: 250,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    rotation: 0,

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        // Draw bird body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw wing
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(-5, 5, 12, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Draw eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(8, -5, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(10, -4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw beak
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(22, -3);
        ctx.lineTo(22, 3);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    },

    update() {
        if (gameState !== 'playing') return;

        this.velocity += this.gravity;
        this.y += this.velocity;

        // Rotation based on velocity
        this.rotation = Math.min(Math.max(this.velocity / 10, -0.5), 1.5);

        // Check boundaries
        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            gameOver();
        }

        if (this.y <= 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },

    flap() {
        if (gameState === 'start') {
            gameState = 'playing';
        }

        if (gameState === 'playing') {
            this.velocity = this.jump;
        }
    },

    reset() {
        this.y = 250;
        this.velocity = 0;
        this.rotation = 0;
    }
};

// Pipe object
const pipes = {
    array: [],
    gap: 150,
    width: 60,
    minHeight: 50,
    maxHeight: canvas.height - 200,

    draw() {
        this.array.forEach(pipe => {
            // Top pipe
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(pipe.x, 0, this.width, pipe.top);

            // Pipe cap (top)
            ctx.fillStyle = '#45a049';
            ctx.fillRect(pipe.x - 5, pipe.top - 20, this.width + 10, 20);

            // Bottom pipe
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(pipe.x, pipe.bottom, this.width, canvas.height - pipe.bottom);

            // Pipe cap (bottom)
            ctx.fillStyle = '#45a049';
            ctx.fillRect(pipe.x - 5, pipe.bottom, this.width + 10, 20);

            // Pipe details (stripes)
            ctx.strokeStyle = '#388E3C';
            ctx.lineWidth = 2;
            for (let i = 20; i < pipe.top; i += 30) {
                ctx.beginPath();
                ctx.moveTo(pipe.x, i);
                ctx.lineTo(pipe.x + this.width, i);
                ctx.stroke();
            }
            for (let i = pipe.bottom + 30; i < canvas.height; i += 30) {
                ctx.beginPath();
                ctx.moveTo(pipe.x, i);
                ctx.lineTo(pipe.x + this.width, i);
                ctx.stroke();
            }
        });
    },

    update() {
        if (gameState !== 'playing') return;

        // Add new pipe
        if (frames % 90 === 0) {
            const topHeight = Math.floor(Math.random() * (this.maxHeight - this.minHeight)) + this.minHeight;
            this.array.push({
                x: canvas.width,
                top: topHeight,
                bottom: topHeight + this.gap,
                passed: false
            });
        }

        // Move and remove pipes
        this.array.forEach((pipe, index) => {
            pipe.x -= 2;

            // Check collision
            if (
                bird.x + bird.width > pipe.x &&
                bird.x < pipe.x + this.width &&
                (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
            ) {
                gameOver();
            }

            // Update score
            if (!pipe.passed && pipe.x + this.width < bird.x) {
                pipe.passed = true;
                score++;

                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('flappyHighScore', highScore);
                    document.getElementById('highScore').textContent = highScore;
                }
            }

            // Remove off-screen pipes
            if (pipe.x + this.width < 0) {
                this.array.splice(index, 1);
            }
        });
    },

    reset() {
        this.array = [];
    }
};

// Background
function drawBackground() {
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#70c5ce');
    gradient.addColorStop(1, '#4a9db3');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    const cloudPositions = [
        { x: (frames * 0.3) % (canvas.width + 100) - 100, y: 80 },
        { x: (frames * 0.2) % (canvas.width + 100) - 100, y: 150 },
        { x: (frames * 0.25) % (canvas.width + 100) - 100, y: 220 }
    ];

    cloudPositions.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
        ctx.arc(cloud.x + 25, cloud.y, 30, 0, Math.PI * 2);
        ctx.arc(cloud.x + 50, cloud.y, 20, 0, Math.PI * 2);
        ctx.fill();
    });

    // Ground
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Grass
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 10);
}

// Draw score
function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';

    if (gameState === 'start') {
        ctx.strokeText('Click to Start!', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Click to Start!', canvas.width / 2, canvas.height / 2);
    } else {
        ctx.strokeText(score, canvas.width / 2, 60);
        ctx.fillText(score, canvas.width / 2, 60);
    }

    if (gameState === 'gameOver') {
        ctx.font = 'bold 50px Arial';
        ctx.strokeText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);

        ctx.font = 'bold 30px Arial';
        ctx.strokeText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 20);

        ctx.font = 'bold 25px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 70);
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 70);
    }
}

// Game over
function gameOver() {
    if (gameState === 'gameOver') return;
    gameState = 'gameOver';

    // Save score to Firebase if user is logged in
    if (window.saveScore && score > 0) {
        window.saveScore(score);
    }
}

// Reset game
function resetGame() {
    frames = 0;
    score = 0;
    gameState = 'start';
    bird.reset();
    pipes.reset();
}

// Main game loop
function gameLoop() {
    frames++;

    drawBackground();
    pipes.draw();
    pipes.update();
    bird.draw();
    bird.update();
    drawScore();

    requestAnimationFrame(gameLoop);
}

// Event listeners
canvas.addEventListener('click', () => {
    bird.flap();
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        bird.flap();
    }

    if (e.code === 'KeyR' && gameState === 'gameOver') {
        resetGame();
    }
});

// Initialize
document.getElementById('highScore').textContent = highScore;
gameLoop();
