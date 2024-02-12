$(document).ready(function () {
  //CHANGE NAME//
  //IN THE FUTURE, DRAW LENGTH FROM BOARD.LENGTH//

  let length = 10;
  let maxShips = 10;
  let maxMasts = 4;
  let bluePrintBoard = [];
  let player1 = ``;
  let player2 = ``;
  let player1Ships = [];
  let player1Board = [];
  let player2Ships = [];
  let player2Board = [];
  let activePlayer = ``;

  function Cell(row, column) {
    this.column = column;
    this.row = row;
    this.sea = true;
    this.ship = false;
    this.shot = false;
    this.hit = false;
    this.sunk = false;
    this.selected = false;
    this.shipBorder = false;
    this.shipTerritory = false;
    this.active = true;
  }
  grabUserName1();
  function grabUserName1() {
    $(`#player-name-button`).on(`click`, function () {
      let userName1 = $(`#player1-name-input`).val();
      player1 = userName1;
      activePlayer = userName1;
      console.log(player1);
      hidePlayer1NameHtml();
      showPlayer2SetUpHtml();
      announcePlayer();
      beginUserSetup(length);
      switchShooterStyle(`player1`);
    });
  }
  function hidePlayer1NameHtml() {
    $(`#player1-name-input`).addClass(`invisible`);
    $(`#player-name-button`).addClass(`invisible`);
  }
  function showPlayer2SetUpHtml() {
    $(`#header`).removeClass(`invisible`);
    $(`#place-ship-button`).removeClass(`invisible`);
  }
  function announcePlayer() {
    $(`#header`).html(`${player1}, ustaw swoją flotę.`);
  }
  function beginUserSetup(length) {
    boardBluePrint(length);
    displayBoard(`bluePrint`, `bluePrint`);
    prepareCellOnclick(bluePrintBoard, `bluePrint`, player1Ships);
    preparePlaceShipOnclick(bluePrintBoard, `bluePrint`, player1Ships);
  }
  function boardBluePrint(length) {
    let cells = [];
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        cells.push(new Cell(column, row));
      }
      bluePrintBoard.push(cells);
      cells = [];
    }
  }
  function displayBoard(destinationId, boardId) {
    $(`#${destinationId}`).html(prepareTable(boardId));
  }
  function prepareTable(boardId) {
    let table = `<table>`;
    table += prepareHeader();
    table += prepareBody(boardId);
    table += `</table>`;
    return table;
  }
  function prepareHeader() {
    let header = `<thead>`;
    header += `<tr>`;
    header += `<th> </th>`;
    for (let column = 0; column < length; column++) {
      header += `<th>${column + 1}</th>`;
    }
    header += `</tr>`;
    header += `</thead>`;
    return header;
  }
  function prepareBody(boardId) {
    let body = `<tbody>`;
    for (let row = 0; row < length; row++) {
      body += `<tr><td id="rowNumber">${row + 1}</td>`;
      for (let column = 0; column < length; column++) {
        body += `<td id="${boardId}-${column + 1}-${row + 1}">
🌊</td>`;
      }
      body += `</tr>`;
    }
    body += `</tbody>`;
    return body;
  }
  function switchShooterStyle(color) {
    switchBackground(color);
  }
  function switchBackground(color) {
    $(`body`).removeClass();
    $(`body`).addClass(`${color}`);
  }
  function prepareCellOnclick(board, boardId) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        highlightCells(board, boardId);
        $(`#${boardId}-${column + 1}-${row + 1}`).on("click", function () {
          if (
            isShipBorder(board, column, row) &&
            isNumberOfMastsLegal(board, maxMasts)
          ) {
            alert(`Statek moze miec maksymalnie 4 maszty.`);
            return;
          }
          if (doesClickedCellTouchShipCell(board, column, row) === false) {
            alert(`Stawiaj jeden statek naraz.`);
            return;
          }
          toggleCellKeys(board, column, row);
          doCellsTouchEachother(board, column, row);
          highlightCells(board, boardId);
        });
      }
    }
  }
  function isNumberOfMastsLegal(board, maxMasts) {
    let selectedCount = 0;
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        if (board[column][row].selected) {
          selectedCount++;
          if (selectedCount === maxMasts) {
            return true;
          }
        }
      }
    }
  }
  function doesClickedCellTouchShipCell(board, column, row) {
    if (
      areAllSeaValuesTrue(board) === false &&
      isAdjacentToSelected(board, column, row) === false &&
      areAtLeastNCellsSelected(board, 2) === true
    ) {
      return false;
    }
  }
  function areAllSeaValuesTrue(board) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < board[row].length; column++) {
        if (board[column][row].sea !== true) {
          return false;
        }
      }
    }
    return true;
  }
  function isAdjacentToSelected(board, column, row) {
    // Check if the clicked cell is adjacent to any selected cell
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        if (
          board[i][j].selected &&
          ((Math.abs(column - i) === 1 && row === j) ||
            (Math.abs(row - j) === 1 && column === i))
        ) {
          return true; // Clicked cell is adjacent to a selected cell
        }
      }
    }
    return false; // Clicked cell is not adjacent to any selected cell
  }
  function areAtLeastNCellsSelected(board, n) {
    let selectedCount = 0;
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < board[row].length; column++) {
        if (board[column][row].selected) {
          selectedCount++;
          if (selectedCount >= n) {
            return true;
          }
        }
      }
    }
    return false;
  }
  function toggleCellKeys(board, column, row) {
    if (board[column][row].selected === false) {
      board[column][row].selected = true;
      board[column][row].sea = false;
    } else if (board[column][row].selected === true) {
      board[column][row].selected = false;
      board[column][row].sea = true;
      markShipCells(board, column, row, false);
    }
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        if (board[column][row].selected === true) {
          markShipCells(board, column, row, true);
        }
      }
    }
  }
  function markShipCells(board, column, row, value) {
    if (column > 0) board[column - 1][row].shipBorder = value;
    if (column < length - 1) board[column + 1][row].shipBorder = value;
    if (row > 0) board[column][row - 1].shipBorder = value;
    if (row < length - 1) board[column][row + 1].shipBorder = value;
  }
  function doCellsTouchEachother(board, column, row) {
    if (
      !areSelectedCellsConnected(board) &&
      areAtLeastNCellsSelected(board, 2)
    ) {
      alert(`Odznaczaj tylko skrajne maszty.`);
      if (board[column][row].selected === false) {
        board[column][row].selected = true;
        board[column][row].sea = false;
      } else if (board[column][row].selected === true) {
        board[column][row].selected = false;
        board[column][row].sea = true;
        markShipCells(board, column, row, false);
      }
      for (let row = 0; row < length; row++) {
        for (let column = 0; column < length; column++) {
          if (board[column][row].selected === true) {
            markShipCells(board, column, row, true);
          }
        }
      }
    }
  }
  function areSelectedCellsConnected(board) {
    const selectedCells = [];
    // Collect all selected cells
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        if (board[column][row].selected) {
          selectedCells.push({ column, row });
        }
      }
    }
    // Check if selected cells are connected
    if (selectedCells.length === 0) {
      return false; // No selected cells, they are trivially connected
    }

    const visited = new Set();
    const queue = [selectedCells[0]];

    while (queue.length > 0) {
      const { column, row } = queue.shift();
      visited.add(`${column}-${row}`);

      // Check adjacent cells
      const neighbors = [
        { column: column - 1, row },
        { column: column + 1, row },
        { column, row: row - 1 },
        { column, row: row + 1 },
      ];

      for (const neighbor of neighbors) {
        if (
          !visited.has(`${neighbor.column}-${neighbor.row}`) &&
          selectedCells.some(
            (cell) =>
              cell.column === neighbor.column && cell.row === neighbor.row
          )
        ) {
          queue.push(neighbor);
        }
      }
    }

    // Check if all selected cells were visited
    return selectedCells.every((cell) =>
      visited.has(`${cell.column}-${cell.row}`)
    );
  }
  function highlightCells(board, boardId) {
    highlightSea(board, boardId);
    highlightShipBorders(board, boardId);
    highlightSelected(board, boardId);
    highlightInactive(board, boardId);
  }
  function highlightSea(board, boardId) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        if (isActiveSea(board, column, row)) {
          highlightCell(column, row, boardId, `cell`, `🌊`);
        }
      }
    }
  }
  function isActiveSea(board, column, row) {
    return (
      board[column][row].sea === true && board[column][row].shipBorder === false
    );
  }
  function highlightCell(column, row, boardId, color, label) {
    $(`#${boardId}-${column + 1}-${row + 1}`).removeClass();
    $(`#${boardId}-${column + 1}-${row + 1}`).addClass(color);
    $(`#${boardId}-${column + 1}-${row + 1}`).html(label);
  }
  function highlightSelected(board, boardId) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        if (isActiveShip(board, column, row, board)) {
          highlightCell(column, row, boardId, `cell`, `⛵`);
        }
      }
    }
  }
  function isActiveShip(board, column, row) {
    return board[column][row].selected === true;
  }
  function highlightShipBorders(board, boardId) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        if (isShipBorder(board, column, row)) {
          highlightCell(column, row, boardId, `cell`, `🌊`);
        }
      }
    }
  }
  function isShipBorder(board, column, row) {
    return (
      board[column][row].selected === false &&
      board[column][row].shipBorder === true
    );
  }
  function highlightInactive(board, boardId) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        if (isInactiveSea(board, column, row)) {
          highlightCell(column, row, boardId, ``, ``);
        } else if (isInactiveShip(board, column, row)) {
          highlightCell(column, row, boardId, ``, `⛵`);
        }
      }
    }
  }
  function isInactiveSea(board, column, row) {
    return (
      board[column][row].active === false && board[column][row].ship === false
    );
  }
  function isInactiveShip(board, column, row) {
    return board[column][row].sea === true && board[column][row].ship === true;
  }
  function preparePlaceShipOnclick(board, boardId, targetShips) {
    $(`#place-ship-button`).on(`click`, function () {
      if (countShipLength(board) === 0) {
        alert(`Postaw choć jeden maszt.`);
        return;
      }
      if (isShipNumberLegal(countShipLength(board), targetShips) === false) {
        alert(`Wyczerpałeś pulę statków tej długości`);
        return;
      }
      let ship = [];
      for (let row = 0; row < length; row++) {
        for (let column = 0; column < length; column++) {
          if (isActiveShip(board, column, row)) {
            ship.push(board[column][row]);
            updateShipTerritory(board, column, row, true);
          }
          if (isShipTerritory(board, column, row)) {
            disengageCell(board, column, row);
            $(`#${boardId}-${column + 1}-${row + 1}`).off(`click`);
          }
          highlightCells(board, boardId);
        }
      }
      for (let row = 0; row < length; row++) {
        for (let column = 0; column < length; column++) {
          if (isShipTerritory(board, column, row)) {
            disengageCell(board, column, row);
            $(`#${boardId}-${column + 1}-${row + 1}`).off(`click`);
          }
          highlightCells(board, boardId);
        }
      }
      targetShips.push(ship);
      console.log(activePlayer);
      if (targetShips.length === maxShips) {
        $(`#place-ship-button`).addClass(`invisible`);
        clearCellOnclick(`bluePrint`);
        if (activePlayer === player1) {
          finishPlayer1SetUp();
        } else if (activePlayer === player2) {
          finishPlayer2Setup();
          activePlayer = player1;
        }
      }
    });
  }
  function countShipLength(board) {
    let shipLength = 0;
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        if (board[column][row].selected) {
          shipLength++;
        }
      }
    }
    return shipLength;
  }
  function isShipNumberLegal(shipLength, shipBoard) {
    let result;
    const maxCounts = {
      1: 4,
      2: 3,
      3: 2,
      4: 1,
    };
    const shipLengthCounts = {};
    for (let ship of shipBoard) {
      const length = ship.length;
      shipLengthCounts[length] = (shipLengthCounts[length] || 0) + 1;
    }
    if (shipLengthCounts[shipLength] >= maxCounts[shipLength]) {
      return false;
    }
    return true;
  }
  function updateShipTerritory(board, column, row, value) {
    board[column][row].shipTerritory = value;
    board[column][row].ship = value;
    if (column > 0) board[column - 1][row].shipTerritory = value;
    if (column < length - 1) board[column + 1][row].shipTerritory = value;
    if (row > 0) board[column][row - 1].shipTerritory = value;
    if (row < length - 1) board[column][row + 1].shipTerritory = value;
    if (column > 0 && row > 0) board[column - 1][row - 1].shipTerritory = value;
    if (column < length - 1 && row < length - 1)
      board[column + 1][row + 1].shipTerritory = value;
    if (column > 0 && row < length - 1)
      board[column - 1][row + 1].shipTerritory = value;
    if (column < length - 1 && row > 0)
      board[column + 1][row - 1].shipTerritory = value;
  }
  function isShipTerritory(board, column, row) {
    return board[column][row].shipTerritory === true;
  }
  function disengageCell(board, column, row) {
    board[column][row].active = false;
    board[column][row].sea = true;
    board[column][row].selected = false;
    board[column][row].shipBorder = false;
  }
  function clearCellOnclick(boardID) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        $(`#${boardID}-${column + 1}-${row + 1}`).off("click");
      }
    }
  }
  function finishPlayer1SetUp() {
    $(`#finish-setup-1`).removeClass("invisible");
    $(`#finish-setup-1`).on(`click`, function () {
      prepareUserBoard(length, player1Ships, player1Board);
      hidePlayer1SetUpHtml();
      showPlayer2NameHtml();
      grabUserName2();
      switchShooterStyle("player2");
    });
  }
  function grabUserName2() {
    $(`#player-name-button`).on(`click`, function () {
      let userName2 = $(`#player2-name-input`).val();
      player2 = userName2;
      activePlayer = player2;
      resetBluePrintTable();
      prepareCellOnclick(bluePrintBoard, `bluePrint`, player2Ships);
      $(`#place-ship-button`).off(`click`);
      preparePlaceShipOnclick(bluePrintBoard, `bluePrint`, player2Ships);
      hidePlayer2NameHtml();
      showPlayer2SetUpHtml(userName2);
    });
  }
  function hidePlayer1SetUpHtml() {
    $(`#header`).addClass(`invisible`);
    $(`#bluePrint`).addClass(`invisible`);
    $(`#finish-setup-1`).addClass(`invisible`);
    $(`#player-name-button`).off(`click`);
  }
  function showPlayer2NameHtml() {
    $(`#player2-name-input`).removeClass(`invisible`);
    $(`#player-name-button`).removeClass(`invisible`);
  }
  function hidePlayer2NameHtml() {
    $(`#player2-name-input`).addClass(`invisible`);
    $(`#player-name-button`).addClass(`invisible`);
  }
  function showPlayer2SetUpHtml() {
    $(`#header`).html(`${player2}, ustaw swoją flotę.`);
    $(`#header`).removeClass(`invisible`);
    $(`#bluePrint`).removeClass(`invisible`);
    $(`#place-ship-button`).removeClass(`invisible`);
    switchShooterStyle("player2");
  }
  function prepareUserBoard(length, targetShips, targetBoard) {
    let masts = targetShips.flat(3);
    let cells = [];
    let cell = [];
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        for (let i = 0; i < masts.length; i++) {
          if (masts[i].column === column && masts[i].row === row) {
            cell.push(masts[i]);
          }
        }
        if (cell != false) {
          cells.push(cell[0]);
        } else {
          cells.push(new Cell(row, column));
        }
        cell = [];
      }
      targetBoard.push(cells);
      cells = [];
    }
  }
  function resetBluePrintTable() {
    bluePrintBoard = [];
    boardBluePrint(length);
    displayBoard(`bluePrint`, `bluePrint`);
    clearCellOnclick(`bluePrint`);
  }
  function finishPlayer2Setup() {
    $(`#finish-setup-2`).removeClass("invisible");
    $(`#finish-setup-2`).on(`click`, function () {
      prepareUserBoard(length, player2Ships, player2Board);
      hideUser2SetUpHtml();
      prepareBeginGameOnclick();
      $(`#begin-game-button`).removeClass(`invisible`);
    });
  }
  function hideUser2SetUpHtml() {
    $(`#finish-setup-2`).addClass("invisible");
    $(`#header`).addClass(`invisible`);
    $(`#bluePrint`).addClass(`invisible`);
  }
  function prepareBeginGameOnclick() {
    $(`#begin-game-button`).on(`click`, function () {
      $(`#header`).removeClass(`invisible`);
      $(`#shootingBoard`).removeClass(`invisible`);
      $(`#begin-game-button`).html(`Przełącz gracza`);
      switchShooterParameters();
    });
  }
  function switchShooterParameters() {
    let boardId;
    let board;
    let shipBoard;
    if (activePlayer === player1) {
      switchShooterStyle(`player1`);
      boardId = `player2Board`;
      board = player2Board;
      shipBoard = player2Ships;
      prepareShotClick(boardId, board, shipBoard, activePlayer);
    } else {
      switchShooterStyle(`player2`);
      boardId = `player1Board`;
      board = player1Board;
      shipBoard = player1Ships;
      prepareShotClick(boardId, board, shipBoard, activePlayer);
    }
  }
  function prepareShotClick(boardId, board, shipBoard, activePlayer) {
    displayBoard(`shootingBoard`, boardId);
    toggleShotCells(boardId, board, shipBoard);
    prepareShootHeader();
    toggleActivePlayer();
  }
  function toggleActivePlayer() {
    if (activePlayer === player1) {
      activePlayer = player2;
    } else if (activePlayer === player2) {
      activePlayer = player1;
    }
  }
  function prepareShootHeader() {
    $(`#header`).html(`<h1>🔫 ${activePlayer}, strzelaj! 🔫</h1>`);
  }
  function toggleShotCells(boardId, board, shipBoard) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        highlightShotCell(boardId, board, column, row);
        highlightSunkShip(boardId, board, shipBoard);
        $(`#${boardId}-${column + 1}-${row + 1}`).on(`click`, function () {
          hasBeenShotAlert(board, column, row);
          markShotCell(board, column, row);
          highlightShotCell(boardId, board, column, row);
          highlightSunkShip(boardId, board, shipBoard);
          announceSinking(board, shipBoard, row, column);
          clearShotClick(boardId, board, shipBoard);
          if (checkWin(shipBoard)) {
            toggleActivePlayer();
            announceWin();
          }
        });
      }
    }
  }
  function clearShotClick(boardId) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        $(`#${boardId}-${column + 1}-${row + 1}`).off(`click`);
      }
    }
  }
  function hasBeenShotAlert(board, column, row) {
    if (board[row][column].shot) {
      $(`#header`).html(`<h1>Silly...</h1>`);
      alert(`Już tutaj strzelałeś, głupku...`);
    }
  }
  function markShotCell(board, column, row) {
    board[row][column].shot = true;
  }
  function highlightShotCell(boardId, board, column, row) {
    if (board[row][column].shot === true && board[row][column].ship === true) {
      board[row][column].hit = true;
      $(`#header`).html(`<h1>Trafiony!</h1>`);
      highlightCell(column, row, boardId, `cell`, `💥`);
    }
    if (board[row][column].shot === true && board[row][column].ship === false) {
      highlightCell(column, row, boardId, `cell`, `🌊`);
      announceMiss(board, row, column);
    }
    if (board[row][column].shot === false) {
      highlightCell(column, row, boardId, `cell`, `☁️`);
    }
  }
  function announceMiss(board, row, column) {
    if (isMiss(board, column, row)) {
      $(`#header`).html(`<h1>Pudło!</h1>`);
    }
  }
  function isMiss(board, column, row) {
    return board[row][column].sea;
  }
  function highlightSunkShip(boardId, board, shipBoard) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        if (
          board[row][column].hit &&
          isShipSunk(board, shipBoard, board[row][column])
        ) {
          highlightCell(column, row, boardId, `cell`, `❌`);
        }
      }
    }
  }
  function announceSinking(board, shipBoard, row, column) {
    if (isShipSunk(board, shipBoard, board[row][column])) {
      $(`#header`).html(`<h1>Zatopiony! 🥳</h1>`);
    }
  }
  function isShipSunk(board, shipBoard, cell) {
    const shipCells = shipBoard.find((ship) => ship.includes(cell));
    if (shipCells && shipCells.every((shipCell) => shipCell.hit)) {
      shipCells.forEach((shipCell) => {
        const { row, column } = shipCell;
        board[row][column].sunk = true;
      });
      return true;
    }
    return false;
  }
  function checkWin(shipBoard) {
    for (let i = 0; i < shipBoard.length; i++) {
      const ship = shipBoard[i];
      for (let j = 0; j < ship.length; j++) {
        if (!ship[j].sunk) {
          return false;
        }
      }
    }
    return true;
  }
  function announceWin() {
    $(`#begin-game-button`).addClass(`invisible`);
    $(`#header`).html(
      `<h1>🥳 Flota zatopiona, ${activePlayer} wygrywa! 🥳</h1>`
    );
  }
  function defaultInputBehaviourOff() {
    $("input").focus(function () {
      // Prevent autofill suggestions
      $(this).attr("autocomplete", "new-password");
    });
  }
});
