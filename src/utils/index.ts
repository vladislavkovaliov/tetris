import { PLAYFIELD_COLUMNS } from "../constants";

export const getRandomElement = (array: string[]): string => {
  const randomIndex = Math.floor(Math.random() * array.length);

  return array[randomIndex];
};

export const convertPositionIndex = (row: number, column: number) => {
  return row * PLAYFIELD_COLUMNS + column;
};

export const rotateMatrix = (matrix: number[][]): number[][] => {
  const size = matrix.length;
  const rotatedMatrix: number[][] = [];

  for (let i = 0; i < size; i++) {
    rotatedMatrix[i] = [];

    for (let j = 0; j < size; j++) {
      rotatedMatrix[i][j] = matrix[size - j - 1][i];
    }
  }

  return rotatedMatrix;
};
