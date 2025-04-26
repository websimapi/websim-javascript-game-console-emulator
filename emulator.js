class Emulator {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentGame = null;
        this.buttonStates = {
            up: false,
            down: false,
            left: false,
            right: false,
            a: false,
            b: false,
            start: false,
            select: false
        };
        
        this.setupControls();
        this.setupGameSelector();
    }
    
    setupControls() {
        // D-pad
        document.getElementById('up').addEventListener('mousedown', () => this.buttonStates.up = true);
        document.getElementById('up').addEventListener('mouseup', () => this.buttonStates.up = false);
        document.getElementById('up').addEventListener('touchstart', () => this.buttonStates.up = true);
        document.getElementById('up').addEventListener('touchend', () => this.buttonStates.up = false);
        
        document.getElementById('down').addEventListener('mousedown', () => this.buttonStates.down = true);
        document.getElementById('down').addEventListener('mouseup', () => this.buttonStates.down = false);
        document.getElementById('down').addEventListener('touchstart', () => this.buttonStates.down = true);
        document.getElementById('down').addEventListener('touchend', () => this.buttonStates.down = false);
        
        document.getElementById('left').addEventListener('mousedown', () => this.buttonStates.left = true);
        document.getElementById('left').addEventListener('mouseup', () => this.buttonStates.left = false);
        document.getElementById('left').addEventListener('touchstart', () => this.buttonStates.left = true);
        document.getElementById('left').addEventListener('touchend', () => this.buttonStates.left = false);
        
        document.getElementById('right').addEventListener('mousedown', () => this.buttonStates.right = true);
        document.getElementById('right').addEventListener('mouseup', () => this.buttonStates.right = false);
        document.getElementById('right').addEventListener('touchstart', () => this.buttonStates.right = true);
        document.getElementById('right').addEventListener('touchend', () => this.buttonStates.right = false);
        
        // Action buttons
        document.getElementById('a').addEventListener('mousedown', () => this.buttonStates.a = true);
        document.getElementById('a').addEventListener('mouseup', () => this.buttonStates.a = false);
        document.getElementById('a').addEventListener('touchstart', () => this.buttonStates.a = true);
        document.getElementById('a').addEventListener('touchend', () => this.buttonStates.a = false);
        
        document.getElementById('b').addEventListener('mousedown', () => this.buttonStates.b = true);
        document.getElementById('b').addEventListener('mouseup', () => this.buttonStates.b = false);
        document.getElementById('b').addEventListener('touchstart', () => this.buttonStates.b = true);
        document.getElementById('b').addEventListener('touchend', () => this.buttonStates.b = false);
        
        // System buttons
        document.getElementById('start').addEventListener('click', () => {
            if (this.currentGame) {
                this.currentGame.onStart();
            }
        });
        
        document.getElementById('select').addEventListener('click', () => {
            if (this.currentGame) {
                this.currentGame.onSelect();
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': this.buttonStates.up = true; break;
                case 'ArrowDown': this.buttonStates.down = true; break;
                case 'ArrowLeft': this.buttonStates.left = true; break;
                case 'ArrowRight': this.buttonStates.right = true; break;
                case 'z': this.buttonStates.a = true; break;
                case 'x': this.buttonStates.b = true; break;
                case 'Enter': if (this.currentGame) this.currentGame.onStart(); break;
                case 'Shift': if (this.currentGame) this.currentGame.onSelect(); break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp': this.buttonStates.up = false; break;
                case 'ArrowDown': this.buttonStates.down = false; break;
                case 'ArrowLeft': this.buttonStates.left = false; break;
                case 'ArrowRight': this.buttonStates.right = false; break;
                case 'z': this.buttonStates.a = false; break;
                case 'x': this.buttonStates.b = false; break;
            }
        });
    }
    
    setupGameSelector() {
        document.getElementById('loadGame').addEventListener('click', () => {
            const gameSelect = document.getElementById('gameSelect');
            const selectedGame = gameSelect.value;
            
            // Clear the canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Reset the current game if any
            if (this.currentGame) {
                this.currentGame.stop();
            }
            
            // Initialize the selected game
            switch(selectedGame) {
                case 'snake':
                    this.currentGame = new SnakeGame(this.canvas, this.ctx, this.buttonStates);
                    break;
                case 'pong':
                    this.currentGame = new PongGame(this.canvas, this.ctx, this.buttonStates);
                    break;
                case 'tetris':
                    this.currentGame = new TetrisGame(this.canvas, this.ctx, this.buttonStates);
                    break;
            }
            
            if (this.currentGame) {
                this.currentGame.start();
            }
        });
    }
}

// Initialize the emulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const emulator = new Emulator();
});

