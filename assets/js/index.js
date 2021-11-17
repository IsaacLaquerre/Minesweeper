const board = document.getElementById("gameBoard");
var boardSize = document.getElementById("boardSize").value;
var bombsLeft = document.getElementById("bombsLeft");

//Delay used to uncover hidden bombs once you lose
var endGameDelay = 10;

//Used to change the value of the amount of cells (CSS variable located in root element)
var root = document.querySelector(":root");

//Colors used for numbers in cells
//////////////   0   /   1   /   2   /   3   /    4    /    5   /   6   /    7   /    8   ///////////////
var colors = ["white", "blue", "red", "green", "purple", "brown", "teal", "black", "grey"];

//Keep track of cells (as "HTMLElement"s) in a 2d array to avoid having to scrape the game board
var boardArray = [];

//Run once body is loaded
function onLoad() {
    drawGrid(boardSize);
    startGame(boardSize);
}

//Drawing a dummy grid to use as game menu background
function drawGrid(boardSize) {
    for (var r = 0; r < boardSize; r++) {
        var row = document.createElement("ul");
        row.classList.add("row", "center", "dummyGrid");
        for (var c = 0; c < boardSize; c++) {
            var cell = document.createElement("li");
            cell.classList.add("cell", "hidden");
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

//Start game menu screen
function startGame(gameEnded) {
    var screen = document.createElement("div");
    screen.classList.add("startMenu");

    var startButton = document.createElement("div");
    startButton.classList.add("startButton");
    startButton.setAttribute("onclick", "{ removeMenu(); setUpBoard(" + boardSize + "); }");

    screen.appendChild(startButton);

    var span = document.createElement("span");
    span.style.position = "absolute";
    span.style.top = "25%";
    span.style.left = "50%";
    span.style.transform = "translateX(-50%)";
    span.style.fontSize = "2.5rem";
    if (gameEnded != undefined && (gameEnded === "lose" || gameEnded === "win")) {
        span.innerHTML = gameEnded === "win" ? "You won! :)" : "You lost :(";
    } else {
        span.innerHTML = "Click \"Start Game\" to play";
    }

    screen.appendChild(span);

    board.appendChild(screen);
}

//Remove game menu screen
function removeMenu() {
    eraseBoard();
}

//Set up game board
function setUpBoard(boardSize) {
    boardArray = [];

    //Nested loop to set up 2d array
    for (var r = 0; r < boardSize; r++) {
        var row = document.createElement("ul");
        row.classList.add("row", "center");

        boardArray[r] = [];
        for (var c = 0; c < boardSize; c++) {
            var cell = document.createElement("li");
            cell.classList.add("cell", "hidden");
            //On left-click
            cell.setAttribute("onclick", "mouseDown(event);");
            //On right-click
            cell.setAttribute("oncontextmenu", "mouseDown(event);");
            cell.innerHTML = "0";
            cell.setAttribute("data-x", r);
            cell.setAttribute("data-y", c);
            row.appendChild(cell);

            boardArray[r][c] = cell;
        }
        board.appendChild(row);
    }

    setCells();
}

//Set up cells
function setCells() {
    //Vaguely balanced amount of bombs according to grid size
    bombsLeft.innerHTML = boardSize * 4 - 22;
    setBombs(boardSize * 4 - 22);

    //Set neighbouring cells' number
    for (var row in boardArray) {
        for (var cell in boardArray[row]) {
            if (boardArray[row] != undefined && boardArray[row][cell].innerHTML != "B") {
                var bombCounter = 0;

                if (cell != 0) {
                    if (boardArray[row][(parseInt(cell) - 1)].innerHTML === "B") bombCounter++;
                }
                if (row != 0) {
                    if (boardArray[(parseInt(row) - 1)][cell].innerHTML === "B") bombCounter++;
                }
                if (row != 0 && cell != boardSize - 1) {
                    if (boardArray[(parseInt(row) - 1)][(parseInt(cell) + 1)].innerHTML === "B") bombCounter++;
                }
                if (row != 0 && cell != 0) {
                    if (boardArray[(parseInt(row) - 1)][(parseInt(cell) - 1)].innerHTML === "B") bombCounter++;
                }
                if (cell != boardSize - 1) {
                    if (boardArray[row][(parseInt(cell) + 1)].innerHTML === "B") bombCounter++;
                }
                if (row != boardSize - 1) {
                    if (boardArray[(parseInt(row) + 1)][cell].innerHTML === "B") bombCounter++;
                }
                if (row != boardSize - 1 && cell != 0) {
                    if (boardArray[(parseInt(row) + 1)][(parseInt(cell) - 1)].innerHTML === "B") bombCounter++;
                }
                if (row != boardSize - 1 && cell != boardSize - 1) {
                    if (boardArray[(parseInt(row) + 1)][(parseInt(cell) + 1)].innerHTML === "B") bombCounter++;
                }

                boardArray[row][cell].innerHTML = bombCounter;
                boardArray[row][cell].style.color = colors[bombCounter];

                if (bombCounter === 0) boardArray[row][cell].style.textIndent = "-100000%";
            }
        }
    }
}

//Set bombs in random cells
function setBombs(bombs) {
    if (bombs != 0) {
        var randRow = Math.floor(Math.random() * boardSize);
        var randCell = Math.floor(Math.random() * boardSize);
        //If cell already has a bomb, don't count it and re-run the function until all bombs are set
        if (boardArray[randRow][randCell].innerHTML != "B") {
            boardArray[randRow][randCell].innerHTML = "B";
            boardArray[randRow][randCell].classList.add("bomb");
            bombs--;
        }
        setBombs(bombs);
    }
}

//Change grid size
function changeSize(value) {
    boardSize = value;
    eraseBoard();
    root.style.setProperty("--cells", value);
    drawGrid(boardSize);
    startGame();
}

////////////////////////////////////
// event.which codes:             //
//                                //
// 1 - Mouse1 (left-click)        //
// 2 - Mouse3 (mousewheel click)  //
// 3 - Mouse2 (right-click)       //
//                                //
// Some mouses have side-buttons: //
//                                //
// 4 - Mouse4 (back side-button)  //
// 5 - Mouse5 (front side-button) //
////////////////////////////////////

//When mouse is clicked
function mouseDown(e) {
    //Prevents context-menu from appearing on right-click
    e.preventDefault();

    var cell = e.path[0];

    //On left-click
    if (e.which === 1) {
        cell.classList.remove("hidden", "flagged");

        if (cell.innerHTML === "0") checkAdjacents(cell);

        if (cell.innerHTML === "B") {
            cell.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
            var bombs = document.getElementsByClassName("bomb");
            for (var c in bombs) {
                if (bombs[c].classList === undefined) break;
                if (bombs[c].classList.contains("hidden")) {
                    bombs[c].classList.remove("hidden");
                }
            }
            /*var flags = document.getElementsByClassName("flagged");
            for (var c in bombs) {

            }*/
            return setTimeout(function() {
                gameOver("lose");
            }, endGameDelay);
        }
        //On right-click
    } else if (e.which === 3) {
        if (cell.classList.contains("hidden")) {
            if (cell.classList.contains("flagged")) {
                bombsLeft.innerHTML = parseInt(bombsLeft.innerHTML) + 1;
                cell.classList.remove("flagged");
            } else {
                if (parseInt(bombsLeft.innerHTML) > 0) {
                    bombsLeft.innerHTML = parseInt(bombsLeft.innerHTML) - 1;
                    cell.classList.add("flagged");
                }
            }
        }
    }

    checkBoard();
}

//Check for cells next to this one that is 0 (multi clearing)
function checkAdjacents(cell) {
    var x = cell.getAttribute("data-x");
    var y = cell.getAttribute("data-y");
    for (var a = 0; a < 8; a++) {
        if (x != 0) {
            if (boardArray[parseInt(x) - 1][y].innerHTML === "0" && boardArray[parseInt(x) - 1][y].classList.contains("hidden")) {
                boardArray[parseInt(x) - 1][y].classList.remove("hidden", "flagged");
                checkAdjacents(boardArray[parseInt(x) - 1][y]);
            } else if (boardArray[parseInt(x) - 1][y].innerHTML != "B" && boardArray[parseInt(x) - 1][y].classList.contains("hidden")) {
                boardArray[parseInt(x) - 1][y].classList.remove("hidden", "flagged");
            }
        }
        if (y != 0) {
            if (boardArray[x][parseInt(y) - 1].innerHTML === "0" && boardArray[x][parseInt(y) - 1].classList.contains("hidden")) {
                boardArray[x][parseInt(y) - 1].classList.remove("hidden", "flagged");
                checkAdjacents(boardArray[x][parseInt(y) - 1]);
            } else if (boardArray[x][parseInt(y) - 1].innerHTML != "B" && boardArray[x][parseInt(y) - 1].classList.contains("hidden")) {
                boardArray[x][parseInt(y) - 1].classList.remove("hidden", "flagged");
            }
        }
        if (x != 0 && y != 0) {
            if (boardArray[parseInt(x) - 1][parseInt(y) - 1].innerHTML === "0" && boardArray[parseInt(x) - 1][parseInt(y) - 1].classList.contains("hidden")) {
                boardArray[parseInt(x) - 1][parseInt(y) - 1].classList.remove("hidden", "flagged");
                checkAdjacents(boardArray[parseInt(x) - 1][parseInt(y) - 1]);
            } else if (boardArray[parseInt(x) - 1][parseInt(y) - 1].innerHTML != "B" && boardArray[parseInt(x) - 1][parseInt(y) - 1].classList.contains("hidden")) {
                boardArray[parseInt(x) - 1][parseInt(y) - 1].classList.remove("hidden", "flagged");
            }
        }
        if (x != 0 && y != boardSize - 1) {
            if (boardArray[parseInt(x) - 1][parseInt(y) + 1].innerHTML === "0" && boardArray[parseInt(x) - 1][parseInt(y) + 1].classList.contains("hidden")) {
                boardArray[parseInt(x) - 1][parseInt(y) + 1].classList.remove("hidden", "flagged");
                checkAdjacents(boardArray[parseInt(x) - 1][parseInt(y) + 1]);
            } else if (boardArray[parseInt(x) - 1][parseInt(y) + 1].innerHTML != "B" && boardArray[parseInt(x) - 1][parseInt(y) + 1].classList.contains("hidden")) {
                boardArray[parseInt(x) - 1][parseInt(y) + 1].classList.remove("hidden", "flagged");
            }
        }
        if (x != boardSize - 1) {
            if (boardArray[parseInt(x) + 1][y].innerHTML === "0" && boardArray[parseInt(x) + 1][y].classList.contains("hidden")) {
                boardArray[parseInt(x) + 1][y].classList.remove("hidden", "flagged");
                checkAdjacents(boardArray[parseInt(x) + 1][y]);
            } else if (boardArray[parseInt(x) + 1][y].innerHTML != "B" && boardArray[parseInt(x) + 1][y].classList.contains("hidden")) {
                boardArray[parseInt(x) + 1][y].classList.remove("hidden", "flagged");
            }
        }
        if (y != boardSize - 1) {
            if (boardArray[x][parseInt(y) + 1].innerHTML === "0" && boardArray[x][parseInt(y) + 1].classList.contains("hidden")) {
                boardArray[x][parseInt(y) + 1].classList.remove("hidden", "flagged");
                checkAdjacents(boardArray[x][parseInt(y) + 1]);
            } else if (boardArray[x][parseInt(y) + 1].innerHTML != "B" && boardArray[x][parseInt(y) + 1].classList.contains("hidden")) {
                boardArray[x][parseInt(y) + 1].classList.remove("hidden", "flagged");
            }
        }
        if (x != boardSize - 1 && y != boardSize - 1) {
            if (boardArray[parseInt(x) + 1][parseInt(y) + 1].innerHTML === "0" && boardArray[parseInt(x) + 1][parseInt(y) + 1].classList.contains("hidden")) {
                boardArray[parseInt(x) + 1][parseInt(y) + 1].classList.remove("hidden", "flagged");
                checkAdjacents(boardArray[parseInt(x) + 1][parseInt(y) + 1]);
            } else if (boardArray[parseInt(x) + 1][parseInt(y) + 1].innerHTML != "B" && boardArray[parseInt(x) + 1][parseInt(y) + 1].classList.contains("hidden")) {
                boardArray[parseInt(x) + 1][parseInt(y) + 1].classList.remove("hidden", "flagged");
            }
        }
        if (x != boardSize - 1 && y != 0) {
            if (boardArray[parseInt(x) + 1][parseInt(y) - 1].innerHTML === "0" && boardArray[parseInt(x) + 1][parseInt(y) - 1].classList.contains("hidden")) {
                boardArray[parseInt(x) + 1][parseInt(y) - 1].classList.remove("hidden", "flagged");
                checkAdjacents(boardArray[parseInt(x) + 1][parseInt(y) - 1]);
            } else if (boardArray[parseInt(x) + 1][parseInt(y) - 1].innerHTML != "B" && boardArray[parseInt(x) + 1][parseInt(y) - 1].classList.contains("hidden")) {
                boardArray[parseInt(x) + 1][parseInt(y) - 1].classList.remove("hidden", "flagged");
            }
        }
    }
}

//Check if all the bombs have been flagged (or if all the flags used were on the right cells)
function checkBoard() {
    if (parseInt(bombsLeft.innerHTML) === 0) {
        var flagged = document.getElementsByClassName("flagged");

        var allBombsFlagged = true;

        for (var c = 0; c < flagged.length; c++) {
            if (flagged[c].innerHTML != "B") allBombsFlagged = false;
        }

        if (allBombsFlagged) setInterval(function() {
            return gameOver("win");
        }, endGameDelay);
    }
}

//Erase the board
function eraseBoard() {
    while (board.lastChild) {
        board.firstChild.remove();
    }
}

//Handle win/lose
function gameOver(type) {
    startGame(type);
}