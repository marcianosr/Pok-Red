// random seed van spel
// sub random seeds
// 5 templates van een patch en dan random 1 kiezen
// en random positie bepalen
// Character movement

// opslaan wanneer je de wereld hebt gegenereerd. De NPC lopen meteen door.
// timestamp en seed opslaan
// epoch time for walking NPC:
// als je NPC in beeld komt wil je "state" van de positie van de NPC

import { mulberry32 } from "./mulberry32";

type Tile = "grass" | "water" | "tree" | "ground" | "bush";
type Grid = {
  x: number;
  y: number;
  type: Tile;
};
const FOREST_SIZE = 20;

const treeMapping = (value: number): Tile => {
  return "tree";
};

const tileColorMapping = (type: Tile) => {
  return {
    grass: "bg-green-500",
    tree: "bg-green-900",
    water: "bg-blue-500",
    ground: "bg-yellow-900",
    bush: "bg-green-700",
  }[type];
};

const canPlaceTile = (grid: Grid[][], x: number, y: number) => {
  // check if the tile is within the grid
  if (x < 0 || y < 0 || x >= grid.length || y >= grid[0].length) {
    return false;
  }

  // check if the tile is not already occupied
  return grid[x][y].type === "grass" || grid[x][y].type === "ground";
};

const generateTreePatches = (
  random: () => number,
  grid: Grid[][],
  startX: number,
  startY: number,
  patchSize: {
    x: number;
    y: number;
  }
) => {
  for (let i = 0; i < patchSize.x; i++) {
    for (let j = 0; j < patchSize.y; j++) {
      const tileType = treeMapping(random());
      const canPlace = canPlaceTile(grid, startX + i, startY + j);

      if (!canPlace) return;

      grid[startX + i][startY + j] = {
        x: startX + i,
        y: startY + j,
        type: tileType,
      };
    }
  }

  return grid;
};

const placeGroundTile = (grid: Grid[][], x: number, y: number) => {
  const isOutOfBounds =
    x < 0 || y < 0 || x >= grid.length || y >= grid[0].length;

  if (isOutOfBounds) {
    return;
  }

  console.log("placing ground tile at", x, y, grid[x][y]);

  grid[x][y] = {
    x,
    y,
    type: "ground",
  };
};

const placePathTiles = (
  grid: Grid[][],
  startCoords: {
    x: number;
    y: number;
  }
) => {
  const directions = {
    up: { x: startCoords.x - 1, y: startCoords.y },
    down: { x: startCoords.x + 1, y: startCoords.y },
    left: { x: startCoords.x, y: startCoords.y - 1 },
    right: { x: startCoords.x, y: startCoords.y + 1 },
  };

  const canMoveUp =
    startCoords.x - 1 >= 0 &&
    grid[directions.up.x][directions.up.y].type !== "tree" &&
    grid[directions.up.x][directions.up.y].type !== "ground";
  const canMoveDown =
    startCoords.x + 1 < grid.length &&
    grid[directions.down.x][directions.down.y].type !== "tree" &&
    grid[directions.down.x][directions.down.y].type !== "ground";
  const canMoveLeft =
    startCoords.y - 1 >= 0 &&
    grid[directions.left.x][directions.left.y].type !== "tree" &&
    grid[directions.left.x][directions.left.y].type !== "ground";
  const canMoveRight =
    startCoords.y + 1 < grid[0].length &&
    grid[directions.right.x][directions.right.y].type !== "tree" &&
    grid[directions.right.x][directions.right.y].type !== "ground";

  // Prioritize movement based on what directions are available
  if (canMoveUp) {
    startCoords.x -= 1;
  } else if (canMoveRight) {
    startCoords.y += 1;
  } else if (canMoveLeft) {
    startCoords.y -= 1;
  } else if (canMoveDown) {
    startCoords.x += 1;
  }

  placeGroundTile(grid, startCoords.x, startCoords.y);
};

const generatePath = (grid: Grid[][]) => {
  // Always start at the bottom
  // Start with a path in the middle

  const zones = [
    {
      name: "Forest Entrance",
      x: FOREST_SIZE - 1,
      y: 9,
    },
    {
      name: "Forest Exit",
      x: 10,
      y: 0,
    },
  ];

  for (let k = 0; k < 10; k++) {
    // Pass zones by reference
    placePathTiles(grid, zones[0]);
  }
};

const generateForest = (random: () => number) => {
  const treePatchSize = {
    x: 1,
    y: 1,
  };

  const initializeForestRows = () => {
    const forestRows: Grid[][] = [];
    const defaultTile = "grass";
    for (let i = 0; i < FOREST_SIZE; i++) {
      const row: Grid[] = [];
      for (let j = 0; j < FOREST_SIZE; j++) {
        row.push({
          x: i,
          y: j,
          type: defaultTile,
        });
      }
      forestRows.push(row);
    }
    return forestRows;
  };

  const grid = initializeForestRows();

  for (let i = 0; i < FOREST_SIZE; i += treePatchSize.x) {
    for (let j = 0; j < FOREST_SIZE; j += treePatchSize.y) {
      const isBorder = j === 0 || j === FOREST_SIZE - 1;

      const dense = random() > 0.985;

      if (dense) {
        generateTreePatches(random, grid, i, j, {
          x: 2,
          y: 2,
        });
      }

      if (isBorder) {
        generateTreePatches(random, grid, i, j, treePatchSize);
      }
    }
  }

  // Call AFTER generating trees, so that the path doesn't overwrite trees

  generatePath(grid);

  return grid;
};

const renderWorld = (world: any) => {
  if (!world) {
    return "no world";
  }

  return world.map((tile: any, i: number) => {
    return (
      <div className="flex" key={i} data-row-idx={i}>
        {tile.map((subTile: any, j: number) => {
          return (
            <div
              key={j}
              data-tile-idx={j}
              className={`size-10 ${tileColorMapping(subTile.type)}`}
            >
              {/* {subTile.type === "tree" ? "🌲" : "s"}/ */}
              <span className="text-xs mx-auto">
                {i},{j}
              </span>
            </div>
          );
        })}
      </div>
    );
  });
};

function App() {
  const seed = 23423;
  const random = mulberry32(seed);
  const world = generateForest(random);

  return (
    <>
      <h1 className="text-3xl font-bold underline">PokeRed</h1>

      <section className="mx-auto">
        <div className="flex flex-col">{renderWorld(world)}</div>
      </section>
    </>
  );
}

export default App;
