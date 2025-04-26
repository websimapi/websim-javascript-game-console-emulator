class SnakeGame {
    constructor(canvas, ctx, buttonStates) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.buttonStates = buttonStates;
        this.gridSize = 10;
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 1, y: 0};
        this.food = this.spawnFood();
        this.score = 0;
        this.gameOver = false;
        this.animationFrameId = null;
        this.lastUpdateTime = 0;
        this.updateInterval = 150; // milliseconds
    }
    
    spawnFood() {
        const maxX = Math.floor(this.canvas.width / this.gridSize) - 1;
        const maxY = Math.floor(this.canvas.height / this.gridSize) - 1;
        
        // Generate a random position for the food
        const food = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
        
        // Make sure the food doesn't spawn on the snake
        for (const segment of this.snake) {
            if (segment.x === food.x && segment.y === food.y) {
                return this.spawnFood(); // Try again
            }
        }
        
        return food;
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
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 1, y: 0};
        this.food = this.spawnFood();
        this.score = 0;
        this.gameOver = false;
    }
    
    update(timestamp) {
        if (this.gameOver) return;
        
        // Check if enough time has passed since the last update
        if (timestamp - this.lastUpdateTime < this.updateInterval) return;
        this.lastUpdateTime = timestamp;
        
        // Handle input
        if (this.buttonStates.up && this.direction.y !== 1) {
            this.direction = {x: 0, y: -1};
        } else if (this.buttonStates.down && this.direction.y !== -1) {
            this.direction = {x: 0, y: 1};
        } else if (this.buttonStates.left && this.direction.x !== 1) {
            this.direction = {x: -1, y: 0};
        } else if (this.buttonStates.right && this.direction.x !== -1) {
            this.direction = {x: 1, y: 0};
        }
        
        // Calculate new head position
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver = true;
            return;
        }
        
        // Add new head to the snake
        this.snake.unshift(head);
        
        // Check if snake eats food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.spawnFood();
            // Speed up as score increases
            this.updateInterval = Math.max(50, 150 - Math.floor(this.score / 50) * 10);
        } else {
            // Remove tail if no food was eaten
            this.snake.pop();
        }
    }
    
    checkCollision(head) {
        // Check for wall collision
        if (
            head.x < 0 || 
            head.y < 0 || 
            head.x >= this.canvas.width / this.gridSize || 
            head.y >= this.canvas.height / this.gridSize
        ) {
            return true;
        }
        
        // Check for self collision
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }
        
        return false;
    }
    
    draw() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the snake
        this.ctx.fillStyle = '#333';
        for (const segment of this.snake) {
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize, 
                this.gridSize
            );
        }
        
        // Draw the head with a different color
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(
            this.snake[0].x * this.gridSize, 
            this.snake[0].y * this.gridSize, 
            this.gridSize, 
            this.gridSize
        );
        
        // Draw the food
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize, 
            this.gridSize
        );
        
        // Draw the score
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 20);
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '18px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
            this.ctx.fillText('Press START to play again', this.canvas.width / 2, this.canvas.height / 2 + 60);
        }
    }
    
    gameLoop(timestamp) {
        this.update(timestamp);
        this.draw();
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
}

