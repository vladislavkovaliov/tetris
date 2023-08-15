import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  TETRAMINOS,
  TETRAMINOS_NAMES,
} from "../constants";
import { getRandomElement, rotateMatrix } from "../utils";

export type TTetramino = {
  name: string;
  matrix: number[][];
  column: number;
  row: number;
  ghostColumn: number;
  ghostRow: number;
};

export class Tertis {
  public playfield: string[][];
  public tetramino: TTetramino;
  public isGameOver: boolean;

  public constructor() {
    this.playfield = [[]];
    this.tetramino = {
      name: "noname",
      matrix: [[]],
      column: 0,
      row: 0,
      ghostRow: 0,
      ghostColumn: 0,
    };
    this.isGameOver = false;

    this.init();
    this.calculateGhostPosition();
  }

  init = (): void => {
    this.generatePlayfield();
    //
    this.generateTetramino();
  };

  generatePlayfield = (): void => {
    this.playfield = new Array(PLAYFIELD_ROWS)
      .fill(0)
      .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
  };

  generateTetramino = (): void => {
    const name = getRandomElement(TETRAMINOS_NAMES);
    const matrix = TETRAMINOS[name];
    const column = PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
    const row = -2;

    this.tetramino = {
      name: name,
      matrix: matrix,
      row: row,
      column: column,
      ghostColumn: 0,
      ghostRow: 0,
    };
    this.calculateGhostPosition();
  };

  moveTetraminoDown = (): void => {
    this.tetramino.row++;

    if (!this.isValid()) {
      this.tetramino.row--;

      this.placeTetramino();
    }
  };

  moveTetraminoLeft = (): void => {
    this.tetramino.column--;

    if (!this.isValid()) {
      this.tetramino.column++;
    } else {
      this.calculateGhostPosition();
    }
  };

  moveTetraminoRight = (): void => {
    this.tetramino.column++;

    if (!this.isValid()) {
      this.tetramino.column--;
    } else {
      this.calculateGhostPosition();
    }
  };

  rotateTetromino = (): void => {
    const originMatrix = this.tetramino.matrix;
    const rotatedMatrix = rotateMatrix(this.tetramino.matrix);

    this.tetramino.matrix = rotatedMatrix;

    if (!this.isValid()) {
      this.tetramino.matrix = originMatrix;
    } else {
      this.calculateGhostPosition();
    }
  };

  isValid = (): boolean => {
    const matrixSize = this.tetramino.matrix.length;

    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        if (!this.tetramino.matrix[i][j]) {
          continue;
        }

        if (this.isOutsideOfBoard(i, j)) {
          return false;
        }

        if (this.isCollides(i, j)) {
          return false;
        }
      }
    }

    return true;
  };

  isOutsideOfBoard = (row: number, col: number): boolean => {
    return (
      this.tetramino.column + col < 0 ||
      this.tetramino.column + col >= PLAYFIELD_COLUMNS ||
      this.tetramino.row + row >= this.playfield.length
    );
  };

  isOutsideOfTopBoard = (i: number): boolean => {
    return this.tetramino.row + i < 0;
  };

  isCollides = (row: number, col: number) => {
    return this.playfield[this.tetramino.row + row]?.[
      this.tetramino.column + col
    ];
  };

  placeTetramino = (): void => {
    const size = this.tetramino.matrix.length;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!this.tetramino.matrix[i][j]) {
          continue;
        }

        if (this.isOutsideOfTopBoard(i)) {
          this.isGameOver = true;
          return;
        }

        this.playfield[this.tetramino.row + i][this.tetramino.column + j] =
          this.tetramino.name;
      }
    }

    this.proccessFilledRows();
    this.generateTetramino();
  };

  proccessFilledRows = (): void => {
    const filledRows = this.getFilledRows();
    this.removeFilledRows(filledRows);
  };

  getFilledRows = (): number[] => {
    const filledRows = [];

    for (let i = 0; i < PLAYFIELD_ROWS; i++) {
      if (this.playfield[i].every((x) => Boolean(x))) {
        filledRows.push(i);
      }
    }

    return filledRows;
  };

  removeFilledRows = (rows: number[]): void => {
    for (let i = 0; i < rows.length; i++) {
      this.dropRowsAbove(rows[i]);
    }
  };

  dropRowsAbove = (row: number): void => {
    for (let i = row; i > 0; i--) {
      this.playfield[i] = this.playfield[i - 1];
    }

    this.playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
  };

  calculateGhostPosition = (): void => {
    const tetraminoRow = this.tetramino.row;

    this.tetramino.row++;

    while (this.isValid()) {
      this.tetramino.row++;
    }

    this.tetramino.ghostRow = this.tetramino.row - 1;
    this.tetramino.ghostColumn = this.tetramino.column;
    this.tetramino.row = tetraminoRow;
  };
}
