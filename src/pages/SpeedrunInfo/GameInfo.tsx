import React from "react";
import { Game } from "./types";
import { Badge } from "@/components/ui/badge";

type GameInfoProps = {
  game: Game;
};

const GameInfo: React.FC<GameInfoProps> = ({ game }) => {
  if (!game) return null;

  return (
    <div className="flex items-start py-4">
      <img
        src={game.assets["cover-medium"].uri || ""}
        alt={game.names.international}
        className="w-32 h-48 object-cover mr-4"
      />
      <div>
        <h1 className="text-2xl font-bold">{game.names.international}</h1>
        {game.platforms &&
          game.platforms.data &&
          game.platforms.data.length > 0 && (
            <div className="flex flex-wrap mt-2">
              {game.platforms.data.map((platform) => (
                <Badge
                  key={platform.id}
                  variant="secondary"
                  className="mr-2 mb-2"
                >
                  {platform.name}
                </Badge>
              ))}
            </div>
          )}
        {game.publishers &&
          game.publishers.data &&
          game.publishers.data.length > 0 && (
            <div className="flex flex-wrap mt-2">
              {game.publishers.data.map((publisher) => (
                <Badge
                  key={publisher.id}
                  variant="secondary"
                  className="mr-2 mb-2"
                >
                  {publisher.name}
                </Badge>
              ))}
            </div>
          )}
        <div className="flex gap-2 mt-2">
          {game.discord && (
            <a
              href={game.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            >
              Discord
            </a>
          )}
          {game.weblink && (
            <a
              href={game.weblink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            >
              Speedrun.com
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
