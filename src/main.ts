import { Tertis } from "./Tetris";

import { convertPositionIndex } from "./utils";

import "./style.css";
import { PLAYFIELD_COLUMNS, PLAYFIELD_ROWS } from "./constants";

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

  const tetris = new Tertis();
  const cells = getCells();

  initKeyDown(tetris);
  //
  draw(tetris, cells);
}

function draw(tetris: Tertis, cells: NodeListOf<Element>) {
  if (cells) {
    cells.forEach((cell) => cell.removeAttribute("class"));
  }
  //
  drawPlayfield(tetris, cells);
  drawTetrmino(tetris, cells);
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

function initKeyDown(tetris: Tertis) {
  document.addEventListener("keydown", (event: KeyboardEvent) =>
    onKeyDown(tetris, event)
  );
}

function onKeyDown(tetris: Tertis, event: KeyboardEvent) {
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
    default: {
      break;
    }
  }
}

function moveDown(tetris: Tertis): void {
  tetris.moveTetraminoDown();
  draw(tetris, getCells());
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

//
main();
