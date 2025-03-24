import { useEffect, useState } from "react";
import { Game } from "./types";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider/FavoritesProvider";
import customAxios from "@/api/custom-axios";
import { toast } from "sonner";

type GameInfoProps = {
  game: Game;
};

const GameInfo: React.FC<GameInfoProps> = ({ game }) => {
  if (!game) return null;
  const { favorites, fetchFavorites } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (favorites) {
      const alreadyFavorited = favorites.some((fav) => fav.gameId === game.id);
      setIsFavorited(alreadyFavorited);
    }
  }, [favorites, game.id]);

  const handleFavoriteClick = async () => {
    let successfulOperation = false;
    const currentFavoritedStatus = isFavorited;
    setIsFavorited(!currentFavoritedStatus);
    try {
      if (isFavorited) {
        // Find the favorite to delete
        const favoriteToDelete = favorites?.find(
          (fav) => fav.gameId === game.id
        );
        if (favoriteToDelete) {
          await customAxios.delete(`/Favorite/${favoriteToDelete.id}`);
          toast("Operation successful", {
            description: `${game.names.international} has been removed from your favorites.`,
          });
        }
      } else {
        // Create a new favorite
        await customAxios.post("/Favorite", {
          gameId: game.id,
          name: game.names.international,
          imageUri: game.assets["cover-medium"].uri,
        });
        toast("Operation successful", {
          description: `${game.names.international} has been added to your favorites.`,
        });
      }
      successfulOperation = true;
    } catch (error) {
      // Revert favorited status if an operation fails
      setIsFavorited(currentFavoritedStatus);
      console.error("Error toggling favorite:", error);
      toast("Operation failed", {
        description: `Something went wrong when trying to ${
          isFavorited ? "remove" : "add"
        } ${
          game.names.international
        } to your favorites. Please try again later.`,
      });
    } finally {
      // Update favorites after creation/deletion
      if (successfulOperation) await fetchFavorites();
    }
  };

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
          <button
            onClick={handleFavoriteClick}
            className={`ml-2 px-2 py-2 transition-colors duration-100 hover:cursor-pointer ${
              isFavorited ? "text-red-500" : "text-white"
            }`}
          >
            <Heart className="w-6 h-6" fill={isFavorited ? "red" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
