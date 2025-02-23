// 游戏常量
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = ['#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];

// 方块形状定义
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

// 游戏状态
let canvas;
let ctx;
let gameLoop;
let score = 0;
let level = 1;
let dropInterval = 1000;
let lastTime = 0;
let dropCounter = 0;
let gameBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let piece = null;

// 初始化游戏
function init() {
    canvas = document.getElementById('tetris');
    ctx = canvas.getContext('2d');
    
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('startBtn').addEventListener('click', startGame);
}

// 创建新方块
function createPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[shapeIndex];
    return {
        shape,
        color: COLORS[shapeIndex],
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

// 绘制方块
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#FFF';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// 绘制游戏面板
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制已固定的方块
    gameBoard.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(x, y, value);
            }
        });
    });
    
    // 绘制当前方块
    if (piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(piece.x + x, piece.y + y, piece.color);
                }
            });
        });
    }
}

// 碰撞检测
function collision() {
    return piece.shape.some((row, dy) => {
        return row.some((value, dx) => {
            if (!value) return false;
            const newX = piece.x + dx;
            const newY = piece.y + dy;
            return newX < 0 || newX >= COLS || newY >= ROWS || 
                   (newY >= 0 && gameBoard[newY][newX]);
        });
    });
}

// 合并方块到游戏面板
function merge() {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                gameBoard[piece.y + y][piece.x + x] = piece.color;
            }
        });
    });
}

// 消除已完成的行
function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (gameBoard[y].every(value => value)) {
            gameBoard.splice(y, 1);
            gameBoard.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        score += linesCleared * 100 * level;
        document.getElementById('score').textContent = score;
        
        // 每1000分升一级
        const newLevel = Math.floor(score / 1000) + 1;
        if (newLevel !== level) {
            level = newLevel;
            document.getElementById('level').textContent = level;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
    }
}

// 旋转方块
function rotate() {
    const rotated = piece.shape[0].map((_, i) =>
        piece.shape.map(row => row[row.length - 1 - i])
    );
    
    const prevShape = piece.shape;
    piece.shape = rotated;
    
    if (collision()) {
        piece.shape = prevShape;
    }
}

// 移动方块
function move(dx, dy) {
    piece.x += dx;
    piece.y += dy;
    
    if (collision()) {
        piece.x -= dx;
        piece.y -= dy;
        
        if (dy > 0) {
            merge();
            clearLines();
            piece = createPiece();
            
            if (collision()) {
                gameOver();
            }
        }
        return false;
    }
    return true;
}

// 处理键盘事件
function handleKeyPress(event) {
    if (!piece) return;
    
    switch (event.keyCode) {
        case 37: // 左箭头
            move(-1, 0);
            break;
        case 39: // 右箭头
            move(1, 0);
            break;
        case 40: // 下箭头
            move(0, 1);
            break;
        case 38: // 上箭头
            rotate();
            break;
        case 32: // 空格
            while (move(0, 1)) {}
            break;
    }
    draw();
}

// 游戏主循环
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        move(0, 1);
        dropCounter = 0;
    }
    
    draw();
    gameLoop = requestAnimationFrame(update);
}

// 开始游戏
function startGame() {
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    // 重置游戏状态
    gameBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    level = 1;
    dropInterval = 1000;
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    
    piece = createPiece();
    update();
    
    document.getElementById('startBtn').textContent = '重新开始';
}

// 游戏结束
function gameOver() {
    cancelAnimationFrame(gameLoop);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2);
    
    piece = null;
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', init);