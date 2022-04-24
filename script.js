function indexOf(arr, i, j) {
  for (let n = 0; n < arr.length; n++) {
    if (arr[n][0] == i && arr[n][1] == j) return n;
  }
  return null;
}

function contains(arr, i, j) {
  return indexOf(arr, i, j) !== null;
}

class Minesweeper {
  bombFrequency = 0.15;

  constructor(width, height) {
    this.width = width;
    this.height = height;
    document.querySelector('#restart').addEventListener('click', () => this.reset());

    this.reset();
  }

  reset() {
    this.squares = [];
    this.opened = [];
    this.flagged = [];
    this.gameOver = false;
    this.createSquares();
    this.hideMessage();
    this.render();
  }

  createSquares() {
    for (let i = 0; i < this.width * this.height; i++) {
      this.squares.push(Math.random() > (1 - this.bombFrequency) ? 'b' : 'n');
    }
  }

  isValidRowCol(row, col) {
    return !(row < 0 || col < 0 || row >= this.height || col >= this.width);
  }

  get(row, col) {
    if (!this.isValidRowCol(row, col)) return null;

    return this.squares[row * this.width + col];
  }

  adjacentSquareIndices(row, col) {
    return [
      [row - 1, col],
      [row, col - 1],
      [row + 1, col],
      [row, col + 1],
      [row + 1, col + 1],
      [row - 1, col + 1],
      [row + 1, col - 1],
      [row - 1, col - 1]
    ];
  }

  adjacentSquares(i, j) {
    return this.adjacentSquareIndices(i, j).map(coords => this.get(...coords));
  }

  count(row, col) {
    return this.adjacentSquares(row, col).reduce((acc, c) => c === 'b' ? acc + 1 : acc, 0);
  }

  clickBomb(i, j) {
    if (this.gameOver) return;

    if (this.opened.length === 0) {
      this.squares[i * this.width + j] = 'n';
      this.click(i, j)
    } else {
      this.opened.push([i, j]);
      this.render();
      this.showMessage('You lost')
    }
  }

  showMessage(st) {
    document.querySelector('#msg').innerHTML = st;
    document.querySelector('#msg').style.display = 'block';
    this.gameOver = true;
  }

  hideMessage() {
    document.querySelector('#msg').style.display = 'none';
  }

  open(i, j) {
    if (!this.isValidRowCol(i, j)) return;
    if (this.hasOpened(i, j)) return;

    this.opened.push([i, j]);
    if (this.count(i, j) === 0) {
      this.adjacentSquareIndices(i, j).forEach(square => this.open(...square))
    }
  }

  click(i, j) {
    if (this.gameOver) return;
    this.open(i, j);
    this.render();
    if (this.hasWon()) {
      this.showMessage('You won!');
    }
  }

  flag(i, j) {
    if (this.gameOver) return;
    if (this.hasFlagged(i, j)) {
      this.unflag(i, j);
    } else {
      this.flagged.push([i, j]);
    }
    this.render();
  }

  hasOpened(i, j) {
    return contains(this.opened, i, j);
  }

  hasFlagged(i, j) {
    return contains(this.flagged, i, j);
  }

  unflag(i, j) {
    this.flagged.splice(indexOf(this.flagged, i, j));
  }

  hasWon() {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.get(i, j) !== 'b' && !this.hasOpened(i, j)) return false;
      }
    }
    return true;
  }

  drawing(i, j) {
    if (this.hasOpened(i, j)) {
      if (this.get(i, j) === 'b') {
        return '💣';
      } else {
        return this.count(i, j);
      }
    } else if (this.hasFlagged(i, j)) {
      return '🚩';
    }
    return '';
  }

  render() {
    const root = document.querySelector('#root');
    root.innerHTML = '';
    for (let i = 0; i < this.height; i++) {
      let tr = document.createElement('tr');
      for (let j = 0; j < this.width; j++) {
        let td = document.createElement('td');
        td.innerHTML = this.drawing(i, j);
        td.classList = this.hasOpened(i, j) ? 'opened' : '';
        td.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.flag(i, j)
        });
        if (this.get(i, j) == 'b') {
          td.addEventListener('click', () => this.clickBomb(i, j));
        } else {
          td.addEventListener('click', () => this.click(i, j));
        }
        tr.appendChild(td);
      }
      root.appendChild(tr);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Minesweeper(8, 8);
})
