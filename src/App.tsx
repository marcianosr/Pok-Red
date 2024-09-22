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
  } = {
    // Default Always start at the bottom
    x: FOREST_SIZE - 1,
    y: 8,
  }
) => {
  placeGroundTile(grid, startCoords.x, startCoords.y);

  if (
    startCoords.x - 1 >= 0 &&
    grid[startCoords.x - 1][startCoords.y].type !== "tree"
  ) {
    startCoords.x -= 1; // Move up
  }
  // Ensure x doesn't exceed the grid boundary
  else if (
    startCoords.x + 1 < grid.length &&
    grid[startCoords.x + 1][startCoords.y].type !== "tree"
  ) {
    startCoords.x += 1; // Move down
  }
  // Ensure the y coordinate is within grid boundaries
  else if (
    startCoords.y - 1 >= 0 &&
    grid[startCoords.x][startCoords.y - 1].type !== "tree"
  ) {
    startCoords.y -= 1; // Move left
  }
  // Ensure y doesn't exceed the grid boundary
  else if (
    startCoords.y + 1 < grid[0].length &&
    grid[startCoords.x][startCoords.y + 1].type !== "tree"
  ) {
    startCoords.y += 1; // Move right
  }
};

const generatePath = (grid: Grid[][]) => {
  // Always start at the bottom
  // Start with a path in the middle
  const pathStartCoords = {
    x: FOREST_SIZE - 1,
    y: 9,
  };
  for (let k = 0; k < 10; k++) {
    // Pass pathStartCoords by reference
    placePathTiles(grid, pathStartCoords);
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

  generatePath(grid);

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
