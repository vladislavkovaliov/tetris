import { Tertis } from "./Tetris";

import { convertPositionIndex } from "./utils";

import "./style.css";
import { PLAYFIELD_COLUMNS, PLAYFIELD_ROWS } from "./constants";

let timeoutId: NodeJS.Timeout | null = null;
let requestId: number | null = null;

const tetris = new Tertis();

export const getCells = () => document.querySelectorAll(".grid > div");

export const createDiv = () => {
  const divElement = document.createElement("div");

  return divElement;
};

export const createGrid = (grid: Element, count: number = 200) => {
  for (let i = 0; i < count; i++) {
    grid.append(createDiv());
  }
};

function main() {
  const gridElement = document.querySelector(".grid");

  if (gridElement) createGrid(gridElement, 200);

  initKeyDown();
  //
  moveDown(tetris);
}

function draw(tetris: Tertis, cells: NodeListOf<Element>) {
  if (cells) {
    cells.forEach((cell) => cell.removeAttribute("class"));
  }
  //
  drawPlayfield(tetris, cells);
  drawTetrmino(tetris, cells);
  drawGhostTetrmino(tetris, cells);
}

function drawTetrmino(tetris: Tertis, cells: NodeListOf<Element>) {
  const name = tetris.tetramino?.name;

  const tetraminoMatrixSize = tetris.tetramino.matrix.length;

  for (let i = 0; i < tetraminoMatrixSize; i++) {
    for (let j = 0; j < tetraminoMatrixSize; j++) {
      if (!tetris.tetramino.matrix[i][j]) {
        continue;
      }

      if (tetris.tetramino.row + i < 0) {
        continue;
      }

      const cellIndex = convertPositionIndex(
        tetris.tetramino.row + i,
        tetris.tetramino.column + j
      );

      if (name) {
        cells[cellIndex].classList.add(name);
      }
    }
  }
}

function drawPlayfield(tetris: Tertis, cells: NodeListOf<Element>) {
  for (let i = 0; i < PLAYFIELD_ROWS; i++) {
    for (let j = 0; j < PLAYFIELD_COLUMNS; j++) {
      if (!tetris.playfield[i][j]) {
        continue;
      }

      const name = tetris.playfield[i][j];
      const cellIndex = convertPositionIndex(i, j);

      cells[cellIndex].classList.add(name);
    }
  }
}

function drawGhostTetrmino(tetris: Tertis, cells: NodeListOf<Element>) {
  const size = tetris.tetramino.matrix.length;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!tetris.tetramino.matrix[i][j]) {
        continue;
      }

      if (tetris.tetramino.ghostRow + i < 0) {
        continue;
      }

      const cellIndex = convertPositionIndex(
        tetris.tetramino.ghostRow + i,
        tetris.tetramino.ghostColumn + j
      );

      cells[cellIndex].classList.add("ghost");
    }
  }
}

function initKeyDown() {
  document.addEventListener("keydown", onKeyDown);
}

function onKeyDown(event: KeyboardEvent) {
  const { key } = event;

  switch (key) {
    case "ArrowUp": {
      rotate(tetris);
      break;
    }
    case "ArrowDown": {
      moveDown(tetris);
      break;
    }
    case "ArrowLeft": {
      moveLeft(tetris);
      break;
    }
    case "ArrowRight": {
      moveRight(tetris);
      break;
    }
    case " ": {
      dropDown(tetris);
      break;
    }
    default: {
      break;
    }
  }
}

function moveDown(tetris: Tertis): void {
  tetris.moveTetraminoDown();

  draw(tetris, getCells());

  stopLoop();
  startLoop(tetris);

  if (tetris.isGameOver) {
    gameOver();
  }
}

function moveLeft(tetris: Tertis): void {
  tetris.moveTetraminoLeft();
  draw(tetris, getCells());
}

function moveRight(tetris: Tertis): void {
  tetris.moveTetraminoRight();
  draw(tetris, getCells());
}

function rotate(tetris: Tertis) {
  tetris.rotateTetromino();
  draw(tetris, getCells());
}

function dropDown(tetris: Tertis) {
  tetris.dropTetrminoDown();

  draw(tetris, getCells());

  stopLoop();
  startLoop(tetris);

  if (tetris.isGameOver) {
    gameOver();
  }
}

function startLoop(tetris: Tertis) {
  timeoutId = setTimeout(() => {
    requestId = requestAnimationFrame(() => moveDown(tetris));
  }, 700);
}

function stopLoop() {
  if (requestId) cancelAnimationFrame(requestId);
  if (timeoutId) clearTimeout(timeoutId);
}

function gameOver() {
  stopLoop();
  document.removeEventListener("keydown", onKeyDown);
}

//
main();
