export class Board {
  static size = '3x3'

  constructor() {}

  calculateCells() {
    const [rows, columns] = Board.size.split('x')

    return +rows * +columns
  }
}
