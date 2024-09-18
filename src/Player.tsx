import palletTown from "./assets/towns/pallet-town.json";
import { useEffect } from "react";

export type PlayerType = {
  x: number;
  y: number;
  radius: number;
};

type PlayerProps = {
  player: PlayerType;
  onPlayerMove: (newPosition: PlayerType) => void;
};

const getNextPosition = (player: PlayerType, direction: string) => {
  switch (direction) {
    case "ArrowUp":
      return {
        x: player.x,
        y: player.y - 1,
        radius: player.radius,
      };
    case "ArrowDown":
      return {
        x: player.x,
        y: player.y + 1,
        radius: player.radius,
      };
    case "ArrowLeft":
      return {
        x: player.x - 1,
        y: player.y,
        radius: player.radius,
      };
    case "ArrowRight":
      return {
        x: player.x + 1,
        y: player.y,
        radius: player.radius,
      };
  }

  return { x: player.x, y: player.y, radius: player.radius };
};

const Player = ({ player, onPlayerMove }: PlayerProps) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const nextPosition = getNextPosition(player, event.key);

    const map = palletTown.tiles;

    const isOutsideBounds =
      nextPosition.x < 0 ||
      nextPosition.x >= map[0].length ||
      nextPosition.y < 0 ||
      nextPosition.y >= map.length;

    const nextTile = !isOutsideBounds
      ? map[nextPosition.y][nextPosition.x]
      : "wall";

    if (!isOutsideBounds && nextTile !== "wall") {
      onPlayerMove(nextPosition);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return <div className={`p-3 bg-red-600`}>RED</div>;
};

export default Player;
