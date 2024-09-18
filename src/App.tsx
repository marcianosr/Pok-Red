import { mulberry32 } from "./mulberry32";

type Tile = "grass" | "water" | "tree" | "ground" | "bush";
type Grid = {
  x: number;
  y: number;
  type: Tile;
}[][];

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

const generateTreePatches = (
  random: () => number,
  grid: Grid,
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

      grid[startX + i][startY + j] = {
        x: startX + i,
        y: startY + j,
        type: tileType,
      };
    }
  }

  return grid;
};

const initializeForestRows = () => {
  const forestRows = [];
  for (let i = 0; i < 20; i++) {
    forestRows.push([]);
  }
  return forestRows;
};

const generateForest = (random: () => number) => {
  const forestSize = 20;
  const data = initializeForestRows(); // Create a 2D array for the entire forest/world grid
  const treePatchSize = 4;

  for (let i = 0; i < forestSize; i += treePatchSize) {
    for (let j = 0; j < forestSize; j += treePatchSize) {
      const patchSize = {
        x: treePatchSize,
        y: treePatchSize,
      };

      generateTreePatches(random, data, i, j, patchSize);
    }
  }

  return data;
};

const renderWorld = (world: any) => {
  if (!world) {
    return "no world";
  }

  return world.map((tile: any, idx: number) => {
    return (
      <div className="flex" key={idx} data-row-idx={idx}>
        {tile.map((subTile: any, idx: number) => {
          return (
            <div
              key={idx}
              data-tile-idx={idx}
              className={`size-10 ${tileColorMapping(subTile.type)}`}
            >
              {subTile.type}
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
