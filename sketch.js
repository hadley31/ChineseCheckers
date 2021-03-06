/**
 * 
 * @author hadley31
 * 
 */

//#region Constants
const VERSION = 1.0;

const TILE_MAP_START_INDICES = [6, 5, 5, 4, 0, 0, 1, 1, 2, 1, 1, 0, 0, 4, 5, 5, 6];
const ROW_SIZES = [1, 2, 3, 4, 13, 12, 11, 10, 9, 10, 11, 12, 13, 4, 3, 2, 1];

const GRID_WIDTH = 13;
const GRID_HEIGHT = 17;

const NO_PIECE = 0;
const GREEN_PIECE = 1;
const BLUE_PIECE = 2;
const BLACK_PIECE = 3;
const RED_PIECE = 4;
const YELLOW_PIECE = 5;
const WHITE_PIECE = 6;

const START_TILES = {
	1: [173, 174, 175, 176, 187, 188, 189, 200, 201, 214],
	2: [127, 140, 141, 152, 153, 154, 165, 166, 167, 168],
	3: [61, 62, 63, 64, 74, 75, 76, 88, 89, 101],
	4: [6, 18, 19, 31, 32, 33, 43, 44, 45, 46],
	5: [52, 53, 54, 55, 65, 66, 67, 79, 80, 92],
	6: [118, 131, 132, 143, 144, 145, 156, 157, 158, 159]
}

const KEYBINDS_TEXT = 'Keybinds:\nReset Board: ESC\nSet Player Count: Alpha_1-6\nToggle Debugging mode: D\nToggle coordinates: C\nSkip Turn: N\nShow Moves: S';

const sqrt3 = 1.73205080757;

//#endregion

let grid;
let currentTile;
let possibleMoves;

let offsetX;
let offsetY;

let radius = 34;
let pieceRadiusMultiplier = 0.8;

let debugMove = false;
let showDebugCoordinates = false;
let showAllPossibleMoves = false;

let playerCount = 2;
let currentTurn;


function setup() {
	console.log(VERSION);

	let canvas = createCanvas(windowWidth, windowHeight);
	canvas.style('display', 'block');

	updateShow();

	init();
}


function draw() {
	background(51);

	textSize(25);
	fill(255);

	if (debugMove) {
		textAlign(LEFT, TOP);
		text('DEBUG MODE', 0, 0);
	}

	textAlign(RIGHT, TOP);
	text(playerCount + ' Players', width, 0);

	let xOff = 0;
	let yOff = 0;

	for (let p of getTurnPieces()) {
		drawPiece(width - xOff * radius * 2 - radius, textSize() + radius + yOff * radius * 2, p);
		xOff++;
		if (xOff >= 3) {
			yOff++;
			xOff = 0;
		}
	}

	fill(255);

	textSize(15);
	textAlign(RIGHT, BOTTOM);
	text(KEYBINDS_TEXT, width - 5, height);

	for (let i = 0; i < grid.length; i++) {
		if (grid[i] != undefined) {
			grid[i].show();
		}
	}

	if (currentTile != undefined) {
		if (showAllPossibleMoves) {
			for (i = 0; i < possibleMoves.length; i++) {
				if (possibleMoves[i] == undefined)
					continue;


				fill(getColor(currentTile.piece));
				ellipse(possibleMoves[i].showX, possibleMoves[i].showY, radius * pieceRadiusMultiplier);
			}
		}
		drawPiece(mouseX, mouseY, currentTile.piece);
	}
}


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	updateShow();
}


function updateShow() {
	radius = min(width, height) / 35;

	offsetX = width / 2 - 6 * radius * 2;
	offsetY = height / 2 - 8 * radius * sqrt3;
}


function init() {
	grid = new Array(GRID_WIDTH * GRID_HEIGHT);

	for (let i = 0; i < GRID_HEIGHT; i++) {
		let start = TILE_MAP_START_INDICES[i];
		let end = start + ROW_SIZES[i];

		for (let j = start; j < end; j++) {
			grid[getIndex(j, i)] = new Tile(j, i);
		}
	}

	for (let i = 0; i < START_TILES[GREEN_PIECE].length; i++) {
		grid[START_TILES[GREEN_PIECE][i]].piece = GREEN_PIECE;
	}

	for (let i = 0; i < START_TILES[BLUE_PIECE].length; i++) {
		grid[START_TILES[BLUE_PIECE][i]].piece = BLUE_PIECE;
	}

	for (let i = 0; i < START_TILES[BLACK_PIECE].length; i++) {
		grid[START_TILES[BLACK_PIECE][i]].piece = BLACK_PIECE;
	}

	for (let i = 0; i < START_TILES[RED_PIECE].length; i++) {
		grid[START_TILES[RED_PIECE][i]].piece = RED_PIECE;
	}

	for (let i = 0; i < START_TILES[YELLOW_PIECE].length; i++) {
		grid[START_TILES[YELLOW_PIECE][i]].piece = YELLOW_PIECE;
	}

	for (let i = 0; i < START_TILES[WHITE_PIECE].length; i++) {
		grid[START_TILES[WHITE_PIECE][i]].piece = WHITE_PIECE;
	}


	currentTurn = GREEN_PIECE;
}


function mousePressed() {
	let tile = getTileUnderMouse();
	if (tile != undefined && tile.piece != NO_PIECE && hasControl(tile.piece)) {
		currentTile = tile;
		possibleMoves = currentTile.getPossibleMoves();
	} else {
		currentTile = undefined;
	}
	return false;
}


function mouseReleased() {
	if (currentTile == undefined) {
		return false;
	}

	let tile = getTileUnderMouse();
	if (validMove(currentTile, tile)) {
		move(currentTile, tile);
		nextTurn();
	}

	currentTile = undefined;

	return false;
}

function validMove(from, to) {
	if (from === undefined || to === undefined || to.piece !== NO_PIECE) return false;
	if (debugMove) return true;

	if (possibleMoves.indexOf(to) == -1)
		return false;

	return true;
}

function move(from, to) {
	to.piece = from.piece;

	from.piece = NO_PIECE;

	let winner = checkWin(to.piece);

	if (winner) {
		print(`Player ${to.piece} wins!`)
	}
}


function keyPressed() {
	switch (keyCode) {
		case 27: // Escape
			setup();
			break;
		case 68: // D
			debugMove = !debugMove;
			break;
		case 67: // C
			showDebugCoordinates = !showDebugCoordinates;
			break;
		case 83: // S
			showAllPossibleMoves = !showAllPossibleMoves;
			break;
		case 49: // Alpha 1
			playerCount = 1;
			break;
		case 50: // Alpha 2
			playerCount = 2;
			break;
		case 51: // Alpha 3
			playerCount = 3;
			break;
		case 52: // Alpha 4
			playerCount = 4;
			break;
		case 54: // Alpha 6
			playerCount = 6;
			break;
		case 78:
			nextTurn();
			break;
	}
}


function nextTurn() {
	currentTurn++;

	if (currentTurn > playerCount)
		currentTurn = 1;
}


function setTurn(value) {
	currentTurn = value;

	if (currentTurn > playerCount || currentTurn < 0)
		currentTurn = 1;
}


function getIndex(x, y) {
	if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
		return -1;
	}

	return x + y * GRID_WIDTH;
}


function getTileUnderMouse() {
	for (let i = 0; i < grid.length; i++) {
		if (grid[i] != undefined && grid[i].withinRange(mouseX, mouseY)) {
			return grid[i];
		}
	}
}


function drawPiece(x, y, piece) {
	let color = getColor(piece);
	fill(color);
	ellipse(x, y, radius * 2 * pieceRadiusMultiplier);
}


function getTile(x, y) {
	return grid[getIndex(x, y)];
}


function brightness_value(c) {
	return 0.2126 * red(c) + 0.7152 * green(c) + 0.0722 * blue(c);
}


function getTurnPieces() {
	if (debugMove || playerCount < 2) return [BLACK_PIECE, RED_PIECE, YELLOW_PIECE, BLUE_PIECE, GREEN_PIECE, WHITE_PIECE];
	if (currentTurn == 1) {
		if (playerCount == 2) return [BLUE_PIECE, GREEN_PIECE, WHITE_PIECE];
		if (playerCount == 3) return [BLUE_PIECE, GREEN_PIECE];
		if (playerCount == 4) return [WHITE_PIECE];
		if (playerCount == 6) return [GREEN_PIECE];
	}
	if (currentTurn == 2) {
		if (playerCount == 2) return [BLACK_PIECE, RED_PIECE, YELLOW_PIECE];
		if (playerCount == 3) return [RED_PIECE, BLACK_PIECE];
		if (playerCount == 4) return [BLUE_PIECE];
		if (playerCount == 6) return [BLUE_PIECE];
	}
	if (currentTurn == 3) {
		if (playerCount == 3) return [WHITE_PIECE, YELLOW_PIECE];
		if (playerCount == 4) return [BLACK_PIECE];
		if (playerCount == 6) return [BLACK_PIECE];
	}
	if (currentTurn == 4) {
		if (playerCount == 4) return [YELLOW_PIECE];
		if (playerCount == 6) return [RED_PIECE];
	}
	if (currentTurn == 5) {
		if (playerCount == 6) return [YELLOW_PIECE];
	}
	if (currentTurn == 6) {
		if (playerCount == 6) return [WHITE_PIECE];
	}
	return [];
}


function hasControl(piece) {
	return getTurnPieces().includes(piece);
}


function getColor(piece) {
	switch (piece) {
		default:
		case 0:
			return color(0, 0, 0);
		case 1:
			return color(20, 144, 20);
		case 2:
			return color(20, 20, 144);
		case 3:
			return color(10, 10, 10);
		case 4:
			return color(160, 20, 20);
		case 5:
			return color(224, 221, 31);
		case 6:
			return color(230, 230, 230);
	}
}

function getOpposite(piece) {
	return (piece + 2) % 6 + 1;
}


function checkWin(piece) {
	return checkWinHelper(piece, START_TILES[getOpposite(piece)]);
}


function checkWinAll() {
	if (checkWin(GREEN_PIECE)) return GREEN_PIECE;
	if (checkWin(BLUE_PIECE)) return BLUE_PIECE;
	if (checkWin(BLACK_PIECE)) return BLACK_PIECE;
	if (checkWin(RED_PIECE)) return RED_PIECE;
	if (checkWin(YELLOW_PIECE)) return YELLOW_PIECE;
	if (checkWin(WHITE_PIECE)) return WHITE_PIECE;
	return NO_PIECE;
}

function checkWinHelper(piece, array) {
	for (const tile_index of array) {
		if (grid[tile_index].piece !== piece)
			return false;
	}
	return true;
}

class Tile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.piece = 0;
	}

	get showX() {
		return this.y % 2 == 0 ? this.x * radius * 2 + offsetX : this.x * radius * 2 + radius + offsetX;
	}

	get showY() {
		return this.y * radius * sqrt3 + offsetY;
	}


	withinRange(x, y) {
		if ((x - this.showX) * (x - this.showX) + (y - this.showY) * (y - this.showY) < radius * radius) {
			return true;
		}
		return false;
	};


	show() {
		fill(150);
		ellipse(this.showX, this.showY, radius * 2);

		if (this.piece != 0 && this != currentTile) {
			drawPiece(this.showX, this.showY, this.piece);
		}

		if (showDebugCoordinates) {
			let color = getColor(this.piece);
			if (brightness_value(color) < 125) {
				fill(255);
			} else {
				fill(0);
			}

			textAlign(CENTER, CENTER);
			textSize(radius * 0.5);

			text(getIndex(this.x, this.y) + '\n' + this.x + ' , ' + this.y, this.showX, this.showY);
		}
	};


	getAdjacentTiles() {
		let adj = new Array(6);

		let x = this.y % 2 == 0 ? this.x : this.x + 1;

		adj[0] = getTile(x, this.y - 1);
		adj[1] = getTile(this.x + 1, this.y);
		adj[2] = getTile(x, this.y + 1);
		adj[3] = getTile(x - 1, this.y + 1);
		adj[4] = getTile(this.x - 1, this.y);
		adj[5] = getTile(x - 1, this.y - 1);

		return adj;
	};


	getPossibleMoves() {
		let possible = [];

		let adj = this.getAdjacentTiles();

		for (let i = 0; i < adj.length; i++) {
			if (adj[i] == undefined) {
				continue;
			}

			if (adj[i].piece == NO_PIECE) {
				possible.push(adj[i]);
			} else {
				let newT = adj[i].getAdjacentTiles()[i];

				if (newT != undefined && newT.piece == NO_PIECE) {
					possible.push(newT);
					possible = this.getPossibleMovesRec(newT, possible);
				}
			}
		}

		return possible;
	};


	getPossibleMovesRec(newT, possible) {
		possible.push(newT);

		let adj = newT.getAdjacentTiles();

		for (let i = 0; i < adj.length; i++) {
			if (adj[i] == undefined) {
				continue;
			}

			if (adj[i].piece == NO_PIECE) {
				continue;
			}

			let next = adj[i].getAdjacentTiles()[i];

			if (possible.indexOf(next) >= 0) {
				continue;
			}

			if (next != undefined && next.piece == NO_PIECE) {
				possible = next.getPossibleMovesRec(next, possible);
			}
		}

		return possible;
	};
}