class TetrisGame {
    constructor(canvas, ctx, buttonStates) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.buttonStates = buttonStates;
        
        this.blockSize = 12;
        this.boardWidth = 10;
        this.boardHeight = 20;
        
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        
        this.tetrominoes = [
            { // I
                shape: [
                    [1, 1, 1, 1]
                ],
                color: '#00FFFF'
            },
            { // J
                shape: [
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: '#0000FF'
            },
            { // L
                shape: [
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                color: '#FF8000'
            },
            { // O
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#FFFF00'
            },
            { // S
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ],
                color: '#00FF00'
            },
            { // T
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: '#800080'
            },
            { // Z
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#FF0000'
            }
        ];
        
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.currentColor = '';
        
        this.score = 0;
        this.gameOver = false;
        this.animationFrameId = null;
        
        this.lastMoveTime = 0;
        this.moveInterval = 500; // milliseconds
        
        this.lastInputTime = 0;
        this.inputCooldown = 100; // milliseconds
    }
    
    start() {
        this.spawnPiece();
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
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.spawnPiece();
    }
    
    spawnPiece() {
        const randomIndex = Math.floor(Math.random() * this.tetrominoes.length);
        const piece = this.tetrominoes[randomIndex];
        
        this.currentPiece = piece.shape;
        this.currentColor = piece.color;
        this.currentX = Math.floor(this.boardWidth / 2) - Math.floor(this.currentPiece[0].length / 2);
        this.currentY = 0;
        
        // Check if the new piece can be placed
        if (!this.isValidMove(0, 0, this.currentPiece)) {
            this.gameOver = true;
        }
    }
    
    isValidMove(offsetX, offsetY, piece) {
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x]) {
                    const newX = this.currentX + x + offsetX;
                    const newY = this.currentY + y + offsetY;
                    
                    // Check boundaries
                    if (newX < 0 || newX >= this.boardWidth || newY >= this.boardHeight) {
                        return false;
                    }
                    
                    // Check collision with placed blocks
                    if (newY >= 0 && this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    rotate() {
        const rotated = [];
        for (let i = 0; i < this.currentPiece[0].length; i++) {
            rotated.push([]);
            for (let j = this.currentPiece.length - 1; j >= 0; j--) {
                rotated[i].push(this.currentPiece[j][i]);
            }
        }
        
        if (this.isValidMove(0, 0, rotated)) {
            this.currentPiece = rotated;
        }
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    const boardY = this.currentY + y;
                    const boardX = this.currentX + x;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentColor;
                    }
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = 0; y < this.boardHeight; y++) {
            let lineIsFull = true;
            
            for (let x = 0; x < this.boardWidth; x++) {
                if (!this.board[y][x]) {
                    lineIsFull = false;
                    break;
                }
            }
            
            if (lineIsFull) {
                linesCleared++;
                
                // Move all lines above down
                for (let y2 = y; y2 > 0; y2--) {
                    for (let x = 0; x < this.boardWidth; x++) {
                        this.board[y2][x] = this.board[y2 - 1][x];
                    }
                }
                
                // Clear the top line
                for (let x = 0; x < this.boardWidth; x++) {
                    this.board[0][x] = 0;
                }
            }
        }
        
        if (linesCleared > 0) {
            // Score calculation
            this.score += [0, 40, 100, 300, 1200][linesCleared];
            
            // Increase speed with score
            this.moveInterval = Math.max(100, 500 - Math.floor(this.score / 1000) * 50);
        }
    }
    
    update(timestamp) {
        if (this.gameOver) return;
        
        // Process user input with cooldown
        if (timestamp - this.lastInputTime > this.inputCooldown) {
            if (this.buttonStates.left) {
                if (this.isValidMove(-1, 0, this.currentPiece)) {
                    this.currentX--;
                }
                this.lastInputTime = timestamp;
            } else if (this.buttonStates.right) {
                if (this.isValidMove(1, 0, this.currentPiece)) {
                    this.currentX++;
                }
                this.lastInputTime = timestamp;
            } else if (this.buttonStates.down) {
                if (this.isValidMove(0, 1, this.currentPiece)) {
                    this.currentY++;
                    this.lastMoveTime = timestamp; // Reset fall timer when pressing down
                }
                this.lastInputTime = timestamp;
            } else if (this.buttonStates.up || this.buttonStates.a) {
                this.rotate();
                this.lastInputTime = timestamp;
            } else if (this.buttonStates.b) {
                // Hard drop
                while (this.isValidMove(0, 1, this.currentPiece)) {
                    this.currentY++;
                }
                this.placePiece();
                this.lastInputTime = timestamp;
            }
        }
        
        // Automatic falling
        if (timestamp - this.lastMoveTime > this.moveInterval) {
            if (this.isValidMove(0, 1, this.currentPiece)) {
                this.currentY++;
            } else {
                this.placePiece();
            }
            this.lastMoveTime = timestamp;
        }
    }
    
    draw() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate board position to center it
        const boardWidthPx = this.boardWidth * this.blockSize;
        const boardHeightPx = this.boardHeight * this.blockSize;
        const offsetX = (this.canvas.width - boardWidthPx) / 2;
        const offsetY = (this.canvas.height - boardHeightPx) / 2;
        
        // Draw background
        this.ctx.fillStyle = '#EEE';
        this.ctx.fillRect(offsetX, offsetY, boardWidthPx, boardHeightPx);
        
        // Draw border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(offsetX, offsetY, boardWidthPx, boardHeightPx);
        
        // Draw the placed blocks
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x], offsetX, offsetY);
                }
            }
        }
        
        // Draw the current piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.length; y++) {
                for (let x = 0; x < this.currentPiece[y].length; x++) {
                    if (this.currentPiece[y][x]) {
                        this.drawBlock(
                            this.currentX + x, 
                            this.currentY + y, 
                            this.currentColor,
                            offsetX,
                            offsetY
                        );
                    }
                }
            }
        }
        
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
    
    drawBlock(x, y, color, offsetX, offsetY) {
        const blockX = offsetX + x * this.blockSize;
        const blockY = offsetY + y * this.blockSize;
        
        // Only draw if block is inside the visible board area
        if (y >= 0) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(blockX, blockY, this.blockSize, this.blockSize);
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(blockX, blockY, this.blockSize, this.blockSize);
        }
    }
    
    gameLoop(timestamp) {
        this.update(timestamp);
        this.draw();
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
}

