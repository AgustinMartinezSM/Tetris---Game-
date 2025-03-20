let dropIntervalNormal = 500;
let dropIntervalSoft = 50;
let dropInterval = dropIntervalNormal;
let lastTime = 0;
let dropCounter = 0;

let score = 0;
let level = 1;
let linesClearedTotal = 0;

const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const filas = 20;
const columnas = 10;
const tamanio = 30;

canvas.width = columnas * tamanio;
canvas.height = filas * tamanio;

const grid = Array.from({ length: filas }, () => Array(columnas).fill({ value: 0, color: null }));

const piezas = [
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
];

const colores = [
    "purple",
    "cyan",
    "yellow",
    "green",
    "red",
    "orange",
    "blue"
];

let pieza = getRandomPieza();
let x = 3, y = 0;

function getRandomPieza() {
    const index = Math.floor(Math.random() * piezas.length);
    return { shape: piezas[index], color: colores[index] };
}

function colisiona(nuevaX, nuevaY, nuevaPieza) {
    return nuevaPieza.shape.some((row, i) =>
        row.some((value, j) =>
            value && (grid[nuevaY + i]?.[nuevaX + j]?.value !== 0 || nuevaY + i >= filas)
        )
    );
}

function fijarPieza() {
    pieza.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                grid[y + i][x + j] = { value: 1, color: pieza.color };
            }
        });
    });

    eliminarLineas();

    pieza = nextPiece;
    nextPiece = getRandomPieza();
    x = 3;
    y = 0;

    if (colisiona(x, y, pieza)) {
        gameOver();
    }
    drawNextPiece();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarGrilla(); // Nueva función para dibujar la grilla
    dibujarPieza(pieza, x, y, ctx); // Nueva función para dibujar la pieza
    drawScore();
}

function dibujarGrilla() {
    for (let fila = 0; fila < filas; fila++) {
        for (let col = 0; col < columnas; col++) {
            if (grid[fila][col].value) {
                dibujarBloque(col * tamanio, fila * tamanio, grid[fila][col].color);
            }
        }
    }
}

function dibujarBloque(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, tamanio, tamanio);
    ctx.strokeRect(x, y, tamanio, tamanio);
}

function dibujarPieza(pieza, x, y, contexto) {
    contexto.fillStyle = pieza.color;
    pieza.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                dibujarBloque((x + j) * tamanio, (y + i) * tamanio, pieza.color);
            }
        });
    });
}
function move(dir) {
    if (!colisiona(x + dir, y, pieza)) {
        x += dir;
        draw();
    }
}

function rotate() {
    const nuevaPieza = pieza.shape[0].map((_, i) => pieza.shape.map(row => row[i])).reverse();
    if (!colisiona(x, y, { shape: nuevaPieza, color: pieza.color })) {
        pieza.shape = nuevaPieza;
        draw();
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
    if (event.key === "ArrowUp") rotate();
    if (event.key === "ArrowDown") y++;
    draw();
});

let rapido = false;

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
        rapido = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowDown") {
        rapido = false;
    }
});

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    dropInterval = rapido ? dropIntervalSoft : dropIntervalNormal;

    if (dropCounter >= dropInterval) {
        if (!colisiona(x, y + 1, pieza)) {
            y++;
        } else {
            fijarPieza();
        }
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

const nextPieceCanvas = document.getElementById("next-piece");
const nextPieceCtx = nextPieceCanvas.getContext("2d");

nextPieceCanvas.width = 4 * tamanio;
nextPieceCanvas.height = 4 * tamanio;

let nextPiece = getRandomPieza();

function drawNextPiece() {
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

    nextPieceCtx.fillStyle = nextPiece.color;
    nextPiece.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                nextPieceCtx.fillRect(j * tamanio, i * tamanio, tamanio, tamanio);
                nextPieceCtx.strokeRect(j * tamanio, i * tamanio, tamanio, tamanio);
            }
        });
    });
}

function generarNuevaPieza() {
    pieza = nextPiece;
    nextPiece = getRandomPieza();
    x = 3;
    y = 0;

    if (colisiona(x, y, pieza)) {
        gameOver();
    }
    drawNextPiece();
}

function eliminarLineas() {
    let linesClearedThisDrop = 0;
    for (let fila = filas - 1; fila >= 0; fila--) {
        if (grid[fila].every(celda => celda.value !== 0)) {
            grid.splice(fila, 1);
            grid.unshift(new Array(columnas).fill({ value: 0, color: null }));
            linesClearedThisDrop++;
        }
    }
    if (linesClearedThisDrop > 0) {
        const pointsPerLine = [0, 40, 100, 300, 1200];
        score += pointsPerLine[linesClearedThisDrop] * level;
        linesClearedTotal += linesClearedThisDrop;

        if (linesClearedTotal >= level * 10) {
            level++;
            dropIntervalNormal = Math.max(100, dropIntervalNormal - 50);
        }
    }
}

function drawScore() {
    document.getElementById("score").textContent = "Puntuación: " + score;
    document.getElementById("level").textContent = "Nivel: " + level;

    let storedHighScore = parseInt(localStorage.getItem("highScore"), 10) || 0;
    document.getElementById("high-score").textContent = "Puntuación más alta: " + storedHighScore;
}

function gameOver() {
    let storedHighScore = parseInt(localStorage.getItem("highScore"), 10) || 0;

    if (score > storedHighScore) {
        localStorage.setItem("highScore", score);
    }

    alert("Game Over.\nPuntuación: " + score + "\nPuntuación más alta: " + localStorage.getItem("highScore"));

    score = 0;
    level = 1;
    linesClearedTotal = 0;
    dropIntervalNormal = 500;

    grid.forEach(row => row.forEach(cell => { cell.value = 0; cell.color = null; }));

    generarNuevaPieza();
}

document.getElementById("dificultad").addEventListener("change", function () {
    const nivel = this.value;
    seleccionarNivel(nivel);
});

function seleccionarNivel(nivel) {
    switch (nivel) {
        case 'fácil':
            dropIntervalNormal = 800;
            break;
        case 'medio':
            dropIntervalNormal = 500;
            break;
        case 'difícil':
            dropIntervalNormal = 300;
            break;
    }
    console.log(`Nivel seleccionado: ${nivel}, Velocidad: ${dropIntervalNormal}`);
}

document.getElementById("restart-button").addEventListener("click", () => {
    score = 0;
    level = 1;
    linesClearedTotal = 0;
    dropIntervalNormal = 500;
    grid.forEach(row => row.forEach(cell => { cell.value = 0; cell.color = null; }));
    generarNuevaPieza();
    requestAnimationFrame(update);
});

drawNextPiece();
requestAnimationFrame(update);

