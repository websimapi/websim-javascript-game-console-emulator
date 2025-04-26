class PongGame {
    constructor(canvas, ctx, buttonStates) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.buttonStates = buttonStates;
        
        this.paddle = {
            width: 10,
            height: 60,
            x: 10,
            y: this.canvas.height / 2 - 30,
            speed: 5
        };
        
        this.aiPaddle = {
            width: 10,
            height: 60,
            x: this.canvas.width - 20,
            y: this.canvas.height / 2 - 30,
            speed: 4
        };
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 5,
            speedX: 3,
            speedY: 3
        };
        
        this.playerScore = 0;
        this.aiScore = 0;
        this.maxScore = 5;
        this.gameOver = false;
        this.animationFrameId = null;
    }
    
    start() {
        this.gameLoop();
    }
    
    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
    
    onStart() {
        if (this.gameOver) {
            this.reset();
        }
    }
    
    onSelect() {
        // Toggle pause or other functionality
    }
    
    reset() {
        this.paddle.y = this.canvas.height / 2 - 30;
        this.aiPaddle.y = this.canvas.height / 2 - 30;
        
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speedX = 3 * (Math.random() > 0.5 ? 1 : -1);
        this.ball.speedY = 3 * (Math.random() > 0.5 ? 1 : -1);
        
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameOver = false;
    }
    
    update() {
        if (this.gameOver) return;
        
        // Move player paddle
        if (this.buttonStates.up) {
            this.paddle.y = Math.max(0, this.paddle.y - this.paddle.speed);
        }
        
        if (this.buttonStates.down) {
            this.paddle.y = Math.min(this.canvas.height - this.paddle.height, this.paddle.y + this.paddle.speed);
        }
        
        // Simple AI for opponent paddle
        const paddleCenter = this.aiPaddle.y + this.aiPaddle.height / 2;
        const ballCenter = this.ball.y;
        
        if (paddleCenter < ballCenter - 10) {
            this.aiPaddle.y += this.aiPaddle.speed;
        } else if (paddleCenter > ballCenter + 10) {
            this.aiPaddle.y -= this.aiPaddle.speed;
        }
        
        // Keep AI paddle in bounds
        this.aiPaddle.y = Math.max(0, Math.min(this.canvas.height - this.aiPaddle.height, this.aiPaddle.y));
        
        // Move ball
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Wall collision (top and bottom)
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.speedY = -this.ball.speedY;
        }
        
        // Paddle collision
        if (
            this.ball.x - this.ball.radius < this.paddle.x + this.paddle.width &&
            this.ball.y > this.paddle.y &&
            this.ball.y < this.paddle.y + this.paddle.height &&
            this.ball.speedX < 0
        ) {
            this.ball.speedX = -this.ball.speedX;
            // Add some angle based on where the ball hits the paddle
            const hitPosition = (this.ball.y - this.paddle.y) / this.paddle.height;
            this.ball.speedY = 6 * (hitPosition - 0.5);
        }
        
        if (
            this.ball.x + this.ball.radius > this.aiPaddle.x &&
            this.ball.y > this.aiPaddle.y &&
            this.ball.y < this.aiPaddle.y + this.aiPaddle.height &&
            this.ball.speedX > 0
        ) {
            this.ball.speedX = -this.ball.speedX;
            // Add some angle based on where the ball hits the paddle
            const hitPosition = (this.ball.y - this.aiPaddle.y) / this.aiPaddle.height;
            this.ball.speedY = 6 * (hitPosition - 0.5);
        }
        
        // Score
        if (this.ball.x < 0) {
            this.aiScore++;
            this.resetBall();
        }
        
        if (this.ball.x > this.canvas.width) {
            this.playerScore++;
            this.resetBall();
        }
        
        // Check for game over
        if (this.playerScore >= this.maxScore || this.aiScore >= this.maxScore) {
            this.gameOver = true;
        }
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speedX = 3 * (Math.random() > 0.5 ? 1 : -1);
        this.ball.speedY = 3 * (Math.random() > 0.5 ? 1 : -1);
    }
    
    draw() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.strokeStyle = '#333';
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.fillRect(this.aiPaddle.x, this.aiPaddle.y, this.aiPaddle.width, this.aiPaddle.height);
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();
        
        // Draw scores
        this.ctx.fillStyle = '#333';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.playerScore.toString(), this.canvas.width / 4, 30);
        this.ctx.fillText(this.aiScore.toString(), 3 * this.canvas.width / 4, 30);
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            
            if (this.playerScore > this.aiScore) {
                this.ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2);
            } else {
                this.ctx.fillText('CPU WINS!', this.canvas.width / 2, this.canvas.height / 2);
            }
            
            this.ctx.font = '18px Arial';
            this.ctx.fillText('Press START to play again', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
}

