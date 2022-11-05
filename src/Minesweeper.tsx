import { Component, createEffect, createMemo, createSignal, JSX } from "solid-js";
import classnames from "./classnames";
import styles from "./styles/Minesweeper.module.css";

interface Cell {
    x: number;
    y: number;
    isBomb: boolean;
    isFlagged: boolean;
    isOpen: boolean;
    bombCount: number;
}

type Grid = Cell[][];

const createCell = (x: number, y: number, isBomb = false): Cell => ({
    x,
    y,
    isBomb,
    bombCount: 0,
    isFlagged: false,
    isOpen: false
})

const createGrid = (size = 6, bombs = Math.floor(size * 1.2)): Grid => {
    console.log("CREATING GRID")

    let grid: Grid = [];
    for (let y = 0; y < size; y++) {
        grid[y] = [];
        for (let x = 0; x < size; x++) {
            let isBombBoolean = false;// bombs > 0 && Math.random() > 0.69;
            grid[y][x] = createCell(x, y, isBombBoolean);

            if (isBombBoolean) {
                bombs--
            }
        }
    }


    if (bombs !== 0) {
        console.error("Not enough bombs placed")
        /* 
            Add more explosives
        */
        for (let _i = 0; _i < bombs; _i++) {
            let x = Math.floor(Math.random() * size)
            let y = Math.floor(Math.random() * size)
            grid[y][x].isBomb = true
        }
    }


    // setBombCount
    const countBombs = ({ x, y }: Cell): number => {
        let count = 0;

        let aboveRow = grid[y - 1];
        let bottomRow = grid[y + 1];

        if (grid[y][x - 1]?.isBomb) count++;
        if (grid[y][x + 1]?.isBomb) count++;

        if (aboveRow) {
            if (aboveRow[x]?.isBomb) count++;
            if (aboveRow[x - 1]?.isBomb) count++;
            if (aboveRow[x + 1]?.isBomb) count++;
        }
        if (bottomRow) {
            if (bottomRow[x]?.isBomb) count++;
            if (bottomRow[x - 1]?.isBomb) count++;
            if (bottomRow[x + 1]?.isBomb) count++;
        }

        return count;
    }

    for (let row of grid) {
        for (let cell of row) {
            cell.bombCount = countBombs(cell)
        }
    }

    return grid;
}


const Flag: Component = () => {
    return <div class={styles.flag}>
        🏴
    </div>
}
const Bomb: Component = () => {
    return <div class={styles.flag}>
        💣
    </div>
}

const Count: Component<{ count: number }> = ({ count }) => {
    return <div class={styles.count} style={{
        "background-color": count === 1 ? "var(--primary-2)" :
            count === 2 ? "var(--warning)"
                : count === 3 ? "var(--success)"
                    : count === 4 ? "var(--info)"
                        : count > 4 ? "var(--danger)"
                            : "var(--primary-1)"
    }}>
        {count}
    </div>
}

const checkIfGameIsWon = (grid: Grid) => {
    for (let row of grid) {
        for (let cell of row) {
            if (!cell.isBomb && !cell.isOpen) {
                return false;
            }
        }
    }

    return true;
}

const Minesweeper: Component<{ size?: number }> = ({ size }) => {
    const [grid, setGrid] = createSignal(createGrid(size), { equals: false })
    const [gameState, setGameState] = createSignal<"NOT_STARTED" | "STARTED" | "SET_FLAG" | "BOOM" | "WON">("NOT_STARTED")

    const restartGame = () => {
        setGameState("NOT_STARTED");
        setGrid((prev) => createGrid(prev.length))


    }

    const showCell = (cell: Cell) => {
        let g = grid();

        let cells: Array<Cell> = [];

        if (!cell.bombCount && !cell.isOpen && !cell.isBomb) {
            const findCells = (cell: Cell) => {
                let cellIsAlreadyInCells = !!cells.find(({ x, y }) => cell.x === x && cell.y === y);
                if (cellIsAlreadyInCells) return;

                cells.unshift(cell);

                if (cell.bombCount) return;

                let rightCell = g[cell.y][cell.x + 1];
                if (rightCell) findCells(rightCell);
                let leftCell = g[cell.y][cell.x - 1];
                if (leftCell) findCells(leftCell);

                let bottomRow = g[cell.y + 1];
                if (bottomRow) {
                    findCells(bottomRow[cell.x])
                    let bRightCell = bottomRow[cell.x + 1]
                    let bLeftCell = bottomRow[cell.x - 1]
                    if (bRightCell) findCells(bRightCell)
                    if (bLeftCell) findCells(bLeftCell)
                }
                let topRow = g[cell.y - 1];
                if (topRow) {
                    findCells(topRow[cell.x])
                    let tRightCell = topRow[cell.x + 1]
                    let tLeftCell = topRow[cell.x - 1]
                    if (tRightCell) findCells(tRightCell)
                    if (tLeftCell) findCells(tLeftCell)
                }
            }
            findCells(cell)
            console.log(cells.length)
        } else {
            cells.unshift(cell)
        }

        setGrid((prev) => {

            for (let c of cells) {
                let item = prev[c?.y!][c?.x!]
                item = {
                    ...item,
                    isOpen: true
                }
                prev[c?.y!][c?.x!] = item
            }
            return prev
        })

        return cells;
    }

    const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
        // Unsmart Workaround
        let cell: Cell | undefined;
        for (let attribute of event.target.attributes) {
            if (attribute.name !== "datatype") {
                continue;
            }
            cell = JSON.parse(attribute.value)
        }

        if (!cell) return;
        if (cell.isOpen) return;



        if (cell.isFlagged) {
            setGrid((prev) => {
                let item = prev[cell?.y!][cell?.x!]
                item = {
                    ...item,
                    isFlagged: false
                }
                prev[cell?.y!][cell?.x!] = item
                return prev
            })

            return
        }

        if (gameState() == "SET_FLAG") {

            setGrid((prev) => {
                let item = prev[cell?.y!][cell?.x!]
                item = {
                    ...item,
                    isFlagged: true
                }
                prev[cell?.y!][cell?.x!] = item
                return prev
            })

            return;
        }

        if (cell.isBomb) {
            // Handle Loss

            setGameState("BOOM")
            return;
        }

        showCell(cell);

    }

    const handleToggleFlagMode = () => {
        setGameState((prev) => {
            if (prev === "SET_FLAG") return "STARTED";
            return "SET_FLAG"
        })
    }

    createEffect(() => {
        // Check if Game is won & do something


        if (checkIfGameIsWon(grid())) {

            setGameState("WON")

        }

    })


    return <>
        {["BOOM", "WON"].includes(gameState()) &&
            <div
                class={classnames(styles.banner, [styles.success, gameState() == "WON"], [styles.danger, gameState() == "BOOM"])}
            >
                Play Again
            </div>

        }

        <div class={styles.board} onClick={handleClick}>
            {grid().map((row) => (
                <div class={styles.row}>
                    {row.map((cell) => (
                        <div class={styles.cell} datatype={JSON.stringify(cell)}>
                            {cell.isFlagged && <Flag />}
                            {(
                                gameState() === "BOOM"
                            ) && cell.isBomb && <Bomb />}
                            {cell.isOpen && <Count count={cell.bombCount} />}
                        </div>
                    ))}
                </div>
            ))}
            <div>
                <button onClick={handleToggleFlagMode}>Set Flag</button>
                <button onClick={restartGame}>Restart</button>
            </div>
        </div>
    </>

}

export default Minesweeper;