$(document).ready(function () {
  let length = 10;
  let maxShips = 10;
  let maxMasts = 4;
  let bluePrintBoard = [];
  let firstUser = ``;
  let secondUser = ``;
  let firstUserShips = [];
  let firstUserBoard = [];
  let secondUserShips = [];
  let secondUserBoard = [];
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

  function showUserNameHtml(targetUser) {
    $(`#app`).html(`<div id="${targetUser}-user-name" class="row">
  <div class="col">
    <div
      class="d-flex justify-content-center align-items-center"
      style="height: 100vh;"
    >
      <div class="justify-content-center align-items-center">
        <input
          autocomplete="off"
          spellcheck="false"
          autocorrect="off"
          autocapitalize="off"
          type="text"
          id="${targetUser}-user-input"
          placeholder="Podaj swoją nazwę"
        />
        <div class="text-center">
          <button id="${targetUser}-user-name-button" class="">
            Zatwierdź
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`);
  }
  function showUserBoardHtml(targetUser) {
    $(`#app`).html(`<div id="${targetUser}-user-board" class="row">
        <div class="col">
          <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
            <div class="justify-content-center align-items-center align-text-cetner">            
              <header class="mx-auto">
                <h1 id="announce-${targetUser}-user">${targetUser}, ustaw swoją flotę!</h1>
              </header>
              <table id="table" class="mx-auto"></table>
              <div class="text-center">
                <button id="${targetUser}-user-ship-button" class="">Zatwierdź</button>
                <button class="invisible" id="finish-${targetUser}-user-board-button">Zatwierdź flotę</button>
              </div>
            </div>
          </div>
        </div>
      </div>`);
  }
  function showBeginGameHtml() {
    $(`#app`).html(`<div class="row">
        <div class="col">
          <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
            <div class="justify-content-center align-items-center">            
              <button id="begin-game-button">
              Rozpocznij grę
              </button>
            </div>
          </div>
        </div>
      </div>`);
  }
  function showGameHtml() {
    $(`#app`).html(`<div class="row">
        <div class="col">
          <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
            <div class="justify-content-center align-items-center">
              <header class="mx-auto">
                <h1 id="header">${activePlayer}, strzelaj!</h1>
              </header>
              <table id="shootingBoard" class="mx-auto"></table>
              <div class="text-center justify-content-center align-items-center">
                <button id="begin-game-button">
                Przełącz gracza
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`);
  }
  function switchShooterStyle(color) {
    switchBackground(color);
  }
  function switchBackground(color) {
    $(`body`).removeClass();
    $(`body`).addClass(`${color}`);
  }
  function highlightCell(column, row, boardId, color, label) {
    $(`#${boardId}-${column + 1}-${row + 1}`).removeClass();
    $(`#${boardId}-${column + 1}-${row + 1}`).addClass(color);
    $(`#${boardId}-${column + 1}-${row + 1}`).html(label);
  }
  function highlightHitCell(boardId, board, column, row) {
    if (board[row][column].shot === true && board[row][column].ship === true) {
      board[row][column].hit = true;
      $(`#header`).html(`<h1>Trafiony!</h1>`);
      highlightCell(column, row, boardId, `cell`, `💥`);
    }
  }
  function highlightMissedCell(boardId, board, column, row) {
    if (board[row][column].shot === true && board[row][column].ship === false) {
      highlightCell(column, row, boardId, `cell`, `🌊`);
      announceMiss(board, row, column);
    }
  }
  function highlightUntouched(boardId, board, column, row) {
    if (board[row][column].shot === false) {
      highlightCell(column, row, boardId, `cell`, `☁️`);
    }
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
  function highlightShotCell(boardId, board, column, row) {
    highlightHitCell(boardId, board, column, row);
    highlightMissedCell(boardId, board, column, row);
    highlightUntouched(boardId, board, column, row);
  }
  function announceMiss(board, row, column) {
    if (board[row][column].sea) {
      $(`#header`).html(`<h1>Pudło!</h1>`);
    }
  }

  grabFirstUserName();
  function grabFirstUserName() {
    showUserNameHtml(`first`);
    $(`#first-user-name-button`).on(`click`, function () {
      prepareUserNameOnclick(`first`, firstUserShips);
      firstUser = activePlayer;
      switchShooterStyle(`firstUser`);
    });
  }
  function prepareUserNameOnclick(user, targetShipBoard) {
    let userName = $(`#${user}-user-input`).val();
    activePlayer = userName;
    showUserBoardHtml(userName);
    beginUserSetup(length, `${userName}-user-ship-button`);
    preparePlaceShipOnclick(
      bluePrintBoard,
      `bluePrint`,
      targetShipBoard,
      `${userName}-user-ship-button`
    );
    switchShooterStyle(user);
  }
  function beginUserSetup(length) {
    boardBluePrint(length);
    displayBoard(`table`, `bluePrint`);
    prepareCellOnclick(bluePrintBoard, `bluePrint`);
  }
  function grabSecondUserName() {
    showUserNameHtml(`second`);
    switchShooterStyle(`noUser`);
    $(`#second-user-name-button`).on(`click`, function () {
      if ($(`#second-user-input`).val() === firstUser) {
        alert(`Nazwy graczy muszą się od siebie różnić`);
        return;
      }
      prepareUserNameOnclick(`second`, secondUserShips);
      secondUser = activePlayer;
      switchShooterStyle(`secondUser`);
    });
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
  function boardBluePrint(length) {
    bluePrintBoard = [];
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
      if (column === 9) {
        header += `<th>X</th>`;
      } else {
        header += `<th>${column + 1}</th>`;
      }
    }
    header += `</tr>`;
    header += `</thead>`;
    return header;
  }
  function prepareBody(boardId) {
    let body = `<tbody>`;
    for (let row = 0; row < length; row++) {
      if (row === 9) {
        body += `<tr><td id="rowNumber">X</td>`;
      } else {
        body += `<tr><td id="rowNumber">${row + 1}</td>`;
      }
      for (let column = 0; column < length; column++) {
        body += `<td id="${boardId}-${column + 1}-${row + 1}">
🌊</td>`;
      }
      body += `</tr>`;
    }
    body += `</tbody>`;
    return body;
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
    console.log($(`#bluePrint-${column + 1}-${row + 1}`).html());
    if (
      !areAllCellsSea(board) &&
      !isAdjacentToSelected(board, column, row) &&
      areAtLeastNCellsSelected(board, 1) &&
      !isFirstSelected(column, row)
    ) {
      return false;
    }
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
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        if (board[column][row].selected) {
          selectedCells.push({ column, row });
        }
      }
    }
    if (selectedCells.length === 0) {
      return false;
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
  function isFirstSelected(column, row) {
    return $(`#bluePrint-${column + 1}-${row + 1}`).html() === `⛵`;
  }
  function areAllCellsSea(board) {
    return board.flatMap((row) => row).every((cell) => cell.sea === true);
  }
  function isAdjacentToSelected(board, column, row) {
    return board
      .flatMap((row) => row)
      .filter((cell) => cell.selected)
      .some(
        (cell) =>
          (Math.abs(column - cell.column) === 1 && row === cell.row) ||
          (Math.abs(row - cell.row) === 1 && column === cell.column)
      );
  }
  function areAtLeastNCellsSelected(board, n) {
    const selectedCells = board
      .flatMap((row) => row)
      .filter((cell) => cell.selected);
    return selectedCells.length >= n;
  }
  function preparePlaceShipOnclick(board, boardId, targetShips, targetButton) {
    $(`#${targetButton}`).on(`click`, function () {
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
          disengageCells(boardId, board, column, row);
        }
      }
      for (let row = 0; row < length; row++) {
        for (let column = 0; column < length; column++) {
          disengageCells(boardId, board, column, row);
        }
      }
      targetShips.push(ship);
      if (targetShips.length === maxShips) {
        $(`#${activePlayer}-user-ship-button`).addClass(`invisible`);
        finishStartup();
      }
    });
  }
  function finishStartup() {
    hideShipButton();
    clearCellOnclick(`bluePrint`);
    if (activePlayer === firstUser) {
      finishFirstPlayerStartup();
    } else if (activePlayer === secondUser) {
      finishSecondUserStartup();
    }
  }
  function hideShipButton() {
    $(`#${activePlayer}-user-ship-button`).addClass(`invisible`);
  }
  function countShipLength(board) {
    let shipLength = board.flatMap((innerArr) =>
      innerArr.filter((obj) => obj.selected === true)
    ).length;
    console.log(shipLength);
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
  function disengageCells(boardId, board, column, row) {
    if (isShipTerritory(board, column, row)) {
      disengageCell(board, column, row);
      $(`#${boardId}-${column + 1}-${row + 1}`).off(`click`);
    }
    highlightCells(board, boardId);
  }
  function clearCellOnclick(boardID) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        $(`#${boardID}-${column + 1}-${row + 1}`).off("click");
      }
    }
  }
  function finishFirstPlayerStartup() {
    $(`#finish-${activePlayer}-user-board-button`).removeClass("invisible");
    $(`#finish-${activePlayer}-user-board-button`).on(`click`, function () {
      prepareUserBoard(length, firstUserShips, firstUserBoard);
      grabSecondUserName();
    });
  }
  function finishSecondUserStartup() {
    $(`#finish-${activePlayer}-user-board-button`).removeClass("invisible");
    $(`#finish-${activePlayer}-user-board-button`).on(`click`, function () {
      prepareUserBoard(length, secondUserShips, secondUserBoard);
      showBeginGameHtml();
      prepareBeginGameOnclick();
      activePlayer = firstUser;
    });
  }
  function prepareBeginGameOnclick() {
    $(`#begin-game-button`).on(`click`, function () {
      showGameHtml();
      switchShooter();
      $(`#begin-game-button`).on(`click`, function () {
        switchShooter();
      });
    });
  }
  function switchShooter() {
    let boardId;
    let board;
    let shipBoard;
    if (activePlayer === firstUser) {
      boardId = `secondUserBoard`;
      board = secondUserBoard;
      shipBoard = secondUserShips;
      switchShooterStyle(`firstUser`);
    } else {
      boardId = `firstUserBoard`;
      board = firstUserBoard;
      shipBoard = firstUserShips;
      switchShooterStyle(`secondUser`);
    }
    prepareShotClick(boardId, board, shipBoard, activePlayer);
  }
  function prepareShotClick(boardId, board, shipBoard) {
    displayBoard(`shootingBoard`, boardId);
    toggleShotCells(boardId, board, shipBoard);
    prepareShootHeader();
    toggleActivePlayer();
  }
  function toggleActivePlayer() {
    if (activePlayer === firstUser) {
      activePlayer = secondUser;
    } else if (activePlayer === secondUser) {
      activePlayer = firstUser;
    }
  }
  function prepareShootHeader() {
    $(`#header`).html(`🔫 ${activePlayer}, strzelaj! 🔫`);
  }
  function toggleShotCells(boardId, board, shipBoard) {
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < length; column++) {
        highlightShotCell(boardId, board, column, row);
        highlightSunkShip(boardId, board, shipBoard);
        $(`#${boardId}-${column + 1}-${row + 1}`).on(`click`, function () {
          if (board[row][column].shot) {
            $(`#header`).html(`<h1>Jełopie Ty...</h1>`);
            alert(`Już tutaj strzelałeś, głupku...`);
            return;
          }
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
  function markShotCell(board, column, row) {
    board[row][column].shot = true;
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
});
