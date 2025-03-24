import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { pageLayout } from "@/lib/common-styles";
import GameInfo from "./GameInfo";
import GameOptions from "./GameOptions";
import ChartDisplay from "./ChartDisplay";
import { Category, Game, Leaderboard, Variable, VariableValues } from "./types";
import { CircularProgress } from "@mui/material";
import { toast } from "sonner";

const SpeedrunInfo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameId = searchParams.get("gameId");
  const [game, setGame] = useState<Game | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [gameCategories, setGameCategories] = useState<Category[]>([]);
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [selectedVariables, setSelectedVariables] = useState<VariableValues>(
    {}
  );
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);

  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameId) {
        return;
      }
      try {
        const gameResponse = await fetch(
          `https://www.speedrun.com/api/v1/games/${gameId}?embed=categories,variables,platforms,publishers`
        );
        if (!gameResponse.ok) throw new Error("Failed to fetch game data");
        const gameData = await gameResponse.json();
        const fetchedGame = gameData.data as Game;
        setGame(fetchedGame);
        setGameCategories(
          fetchedGame.categories.data.filter(
            (category) => category.type !== "per-level"
          )
        );
        // This is to avoid level-specific categories. When I add levels, this will no longer be necessary
        const firstSelectedCategory = fetchedGame.categories.data.find(
          (cat) => cat.type !== "per-level"
        );
        if (!firstSelectedCategory)
          throw new Error(
            `Failed to find a per-game category for ${game?.names.international}`
          );
        setSelectedCategory(firstSelectedCategory.id as string);
      } catch (err: any) {
        toast("Operation failed", {
          description:
            "Something went wrong with trying to search for that game. Please try again later.",
        });
        navigate("/");
      }
    };
    fetchGameData();
  }, [gameId, navigate]);

  useEffect(() => {
    if (!game || !selectedCategory) return;
    const updateVariables = () => {
      if (
        game.variables &&
        game.variables.data.length > 0 &&
        selectedCategory
      ) {
        const categoryVariables: Variable[] = game.variables.data.filter(
          (variable) =>
            variable.category === selectedCategory && variable.mandatory
        );
        setAvailableVariables(categoryVariables);
        const initialSelectedVariables: {
          [key: string]: { id: string; label: string };
        } = {};
        categoryVariables.forEach((variable) => {
          if (variable.values && variable.values.values) {
            const firstValueId = Object.keys(variable.values.values)[0];
            const firstValueLabel = variable.values.values[firstValueId].label;
            initialSelectedVariables[variable.id] = {
              id: firstValueId,
              label: firstValueLabel,
            };
          }
        });
        setSelectedVariables(initialSelectedVariables);
      } else {
        setAvailableVariables([]);
        setSelectedVariables({});
      }
    };
    updateVariables();
  }, [game, selectedCategory]);

  const fetchLeaderboard = async () => {
    if (!game) return;
    setLeaderboard(null);
    try {
      let url = `https://www.speedrun.com/api/v1/leaderboards/${game?.id}/category/${selectedCategory}?top=100&embed=players`;
      Object.entries(selectedVariables).forEach(([varId, value]) => {
        url += `&var-${varId}=${value.id}`;
      });
      const leaderboardResponse = await fetch(url);
      if (!leaderboardResponse.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const leaderboardData = await leaderboardResponse.json();
      setLeaderboard(leaderboardData.data);
    } catch (err: any) {
      toast("Operation failed", {
        description: `Unable to fetch the leaderboard for the ${selectedCategory} category for ${game.names.international}. Either try refreshing the page, or try again later.`,
      });
    }
  };

  useEffect(() => {
    if (!game || !selectedCategory) return;
    fetchLeaderboard();
  }, [game, selectedCategory, selectedVariables]);

  if (!game)
    return (
      <div className={`${pageLayout} justify-center items-center`}>
        <CircularProgress size={150} />
      </div>
    );

  return (
    <div className={`${pageLayout} items-center`}>
      <GameInfo game={game} />
      {game && game.categories && game.variables && (
        <GameOptions
          categories={gameCategories}
          selectedCategory={selectedCategory}
          availableVariables={availableVariables}
          selectedVariables={selectedVariables}
          setSelectedCategory={setSelectedCategory}
          setSelectedVariables={setSelectedVariables}
        />
      )}
      <ChartDisplay leaderboard={leaderboard} />
    </div>
  );
};

export default SpeedrunInfo;
