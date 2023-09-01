import Hammer from "hammerjs";

import { Tertis } from "./Tetris";

import { convertPositionIndex, getCells } from "./utils";

import { PLAYFIELD_COLUMNS, PLAYFIELD_ROWS, ASS } from "./constants";

import "./style.css";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import {
  addDoc,
  collection,
  getFirestore,
  Firestore,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfOPXt5do_F2jDFzokwSQD14kUan1KVAg",
  authDomain: "tetris-4f4f6.firebaseapp.com",
  projectId: "tetris-4f4f6",
  storageBucket: "tetris-4f4f6.appspot.com",
  messagingSenderId: "302050048482",
  appId: "1:302050048482:web:57ef88c3a307fda32f21bb",
  measurementId: "G-5L9ZCKQELD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore();

export async function sendEvent(
  firestore: Firestore,
  eventName: string,
  payload: Record<string, any>
) {
  const col = collection(firestore, "events");

  const data = {
    eventName: eventName,
    ...payload,
  };

  try {
    await addDoc(col, data);
  } catch (e) {
    console.log(e);
  }
}

let timeoutId: NodeJS.Timeout | null = null;
let requestId: number | null = null;
let hammer: HammerManager | null = null;

const scoreElement = document.querySelector("#score-value");

const tetris = new Tertis();

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
  initTouch();
  //
  moveDown(tetris);
}

function draw(tetris: Tertis, cells: NodeListOf<Element>) {
  if (cells) {
    cells.forEach((cell) => cell.removeAttribute("class"));
  }
  //
  if (scoreElement) {
    scoreElement.textContent = tetris.scoreValue.toString();
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

function drawBad(cells: NodeListOf<Element>) {
  const TOP_OFFSET = 5;

  for (let i = 0; i < ASS.length; i++) {
    for (let j = 0; j < ASS[0].length; j++) {
      if (!ASS[i][j]) {
        continue;
      }

      const cellIndex = convertPositionIndex(TOP_OFFSET + i, j);

      cells[cellIndex].classList.add("ass");
    }
  }
}

function initKeyDown() {
  document.addEventListener("keydown", onKeyDown);
}

function initTouch() {
  document.addEventListener("dblclick", (event) => {
    event.preventDefault();
  });

  const body = document.querySelector("body");

  if (body) {
    hammer = new Hammer(body);
  }

  if (hammer) {
    hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
    hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

    const threshold = 30;

    let deltaY = 0;
    let deltaX = 0;

    hammer.on("panstart", () => {
      deltaY = 0;
      deltaX = 0;
    });

    hammer.on("panleft", (event: HammerInput) => {
      if (Math.abs(event.deltaX - deltaX) > threshold) {
        moveLeft(tetris);

        deltaX = event.deltaX;
        deltaY = event.deltaY;
      }
    });

    hammer.on("panright", (event: HammerInput) => {
      if (Math.abs(event.deltaX - deltaX) > threshold) {
        moveRight(tetris);

        deltaX = event.deltaX;
        deltaY = event.deltaY;
      }
    });

    hammer.on("pandown", (event: HammerInput) => {
      if (Math.abs(event.deltaY - deltaY) > threshold) {
        moveDown(tetris);

        deltaX = event.deltaX;
        deltaY = event.deltaY;
      }
    });

    hammer.on("swipedown", () => {
      dropDown(tetris);
    });

    hammer.on("tap", () => {
      rotate(tetris);
    });
  }
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
  logEvent(analytics, "game_over", { score: tetris.scoreValue });
  stopLoop();
  document.removeEventListener("keydown", onKeyDown);

  if (hammer) {
    hammer.off("panleft panright pandown panstart swipedown");
  }

  gameOverAnimation(getCells());
}

function gameOverAnimation(cells: NodeListOf<Element>) {
  const filledCells = [...cells].filter((x) => x.classList.length > 0);

  filledCells.forEach((x, i) => {
    setTimeout(() => {
      x.classList.add("hide");
    }, i * 10);

    setTimeout(() => {
      x.removeAttribute("class");
    }, i * 10 + 500);
  });

  setTimeout(() => {
    drawBad(getCells());
  }, filledCells.length * 10 + 1000);
}

//
document.addEventListener("DOMContentLoaded", () => {
  const reffer = document.referrer;

  logEvent(analytics, "reffer", { reffer: reffer });
  sendEvent(firestore, "reffer", { reffer: reffer });

  main();
});
