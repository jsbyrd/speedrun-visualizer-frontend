import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { pageLayout } from "@/lib/common-styles";
import GameInfo from "./GameInfo";
import GameOptions from "./GameOptions";
import ChartDisplay from "./ChartDisplay";
import {
  Category,
  Game,
  Leaderboard,
  Variable,
  VariableValues,
  RunData,
} from "./types";
import { CircularProgress } from "@mui/material";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopTenHistory from "./TopTenHistory";
import { fetchAllRunsData, fetchLeaderboardData } from "./utils";

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
  const [runs, setRuns] = useState<RunData[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);

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
        const firstSelectedCategory = fetchedGame.categories.data.find(
          (cat) => cat.type !== "per-level"
        );
        if (!firstSelectedCategory)
          throw new Error(
            `Failed to find a per-game category for ${game?.names?.international}`
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
            (variable.category === selectedCategory ||
              variable.category == null) &&
            variable.mandatory &&
            (!variable.scope.type || !variable.scope.type.includes("level"))
        );

        const validVariables = categoryVariables.filter(isValidVariable);

        setAvailableVariables(validVariables);

        const initialSelectedVariables: VariableValues = {};
        validVariables.forEach((variable) => {
          if (variable.values && variable.values.values) {
            const firstValueId = Object.keys(variable.values.values)[0];
            const firstValueLabel = variable.values.values[firstValueId].label;
            const firstValueRules = variable.values.values[firstValueId].rules;
            initialSelectedVariables[variable.id] = {
              id: firstValueId,
              label: firstValueLabel,
              rules: firstValueRules,
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
    if (!game || !selectedCategory) return;
    setLeaderboard(null);
    try {
      const leaderboardData = await fetchLeaderboardData(
        game.id,
        selectedCategory,
        selectedVariables
      );
      setLeaderboard(leaderboardData);
    } catch (err: any) {
      toast("Operation failed", {
        description: `Unable to fetch the leaderboard for the ${selectedCategory} category of ${game.names.international}. Either refresh the page, or try again later.`,
      });
    }
  };

  const fetchAllRuns = async () => {
    if (!game || !selectedCategory) return;
    setIsLoadingRuns(true);
    try {
      const allRuns = await fetchAllRunsData(
        game.id,
        selectedCategory,
        selectedVariables
      );
      setRuns(allRuns);
    } catch (error) {
      console.log(error);
      toast("Operation failed", {
        description: `Something went wrong when trying to get the top 10 history for the ${selectedCategory} category of ${game.names.international}. Either refresh the page, or try again later.`,
      });
    } finally {
      setIsLoadingRuns(false);
    }
  };

  useEffect(() => {
    if (!game || !selectedCategory) return;
    fetchLeaderboard();
    setRuns([]);
  }, [game, selectedCategory, selectedVariables]);

  const handleDebug = () => {
    //constsuigiBestRun=runs.find((run)=>run.times.primary_t==5728);
    //console.log(suigiBestRun);
    console.log("leaderboard", leaderboard);
    console.log("gameId", gameId);
    console.log("categoryId", selectedCategory);
    console.log("variables", selectedVariables);
    console.log("availableVariables", availableVariables);
    console.log("runs", runs);
  };

  if (!game)
    return (
      <div className={`${pageLayout} justify-center items-center`}>
        <CircularProgress size={150} />
      </div>
    );

  return (
    <div className={`${pageLayout} items-center`}>
      <button onClick={handleDebug}>Debug</button>
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
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mt-12">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="history">Top10History</TabsTrigger>
        </TabsList>
        <TabsContent value="chart">
          <ChartDisplay leaderboard={leaderboard} />
        </TabsContent>
        <TabsContent value="history">
          <TopTenHistory
            runs={runs}
            isLoading={isLoadingRuns}
            onFetchRuns={fetchAllRuns}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function isValidVariable(variable: Variable) {
  if (!variable.values || !variable.values.values) {
    return true;
  }

  for (const valueKey in variable.values.values) {
    if (variable.values.values[valueKey].rules === "test") {
      return false;
    }
  }

  return true;
}

export default SpeedrunInfo;
