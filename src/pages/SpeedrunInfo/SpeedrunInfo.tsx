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
  const [topTenHistory, setTopTenHistory] = useState<RunData[]>([]);

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

  const fetchAllRuns = async () => {
    if (!game) return;
    setIsLoadingRuns(true);
    try {
      let url = `https://www.speedrun.com/api/v1/runs?game=${game.id}&category=${selectedCategory}&embed=players&status=verified&orderby=date&max=200`;
      Object.entries(selectedVariables).forEach(([varId, value]) => {
        url += `&var-${varId}=${value.id}`;
      });

      let allRuns: RunData[] = [];
      let nextUrl: string | null = url;

      while (nextUrl) {
        let runsResponse: any;
        let retry = true;
        while (retry) {
          runsResponse = await fetch(nextUrl);
          if (runsResponse.status === 420) {
            console.log("Rate limit reached. Waiting 1 second...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            retry = false;
          }
        }
        if (!runsResponse.ok) {
          throw new Error("Failed to fetch runs");
        }
        const runsData = await runsResponse.json();
        allRuns = allRuns.concat(runsData.data as RunData[]);
        if (runsData.pagination && runsData.pagination.links) {
          const nextLink = runsData.pagination.links.find(
            (link: any) => link.rel === "next"
          );
          nextUrl = nextLink ? nextLink.uri : null;
        } else {
          nextUrl = null;
        }
      }

      const top10: RunData[] = [];
      const top10History: RunData[] = [];
      const runsWithCorrectVariables = allRuns.filter((run) => {
        for (const varId in selectedVariables) {
          if (run.values[varId] !== selectedVariables[varId].id) {
            return false;
          }
        }
        return true;
      });

      const startTime = performance.now();

      runsWithCorrectVariables.forEach((run) => {
        if (!run.date) {
          return;
        }

        const runTime = run.times.primary_t;
        const player = run.players.data[0];
        if (!player) return;
        const playerId = player.id;

        const duplicatePlayerIndex = top10.findIndex(
          (topRun) => topRun.players.data[0].id === playerId
        );

        if (top10.length < 10) {
          console.log(run);
          if (
            duplicatePlayerIndex !== -1 &&
            run.times.primary_t < top10[duplicatePlayerIndex].times.primary_t
          )
            top10[duplicatePlayerIndex] = run;
          else if (
            duplicatePlayerIndex !== -1 &&
            run.times.primary_t > top10[duplicatePlayerIndex].times.primary_t
          ) {
            return;
          } else top10.push(run);
          top10.sort((a, b) => a.times.primary_t - b.times.primary_t);
          top10History.push(run);
          return;
        }

        if (runTime <= top10[9].times.primary_t) {
          if (
            duplicatePlayerIndex !== -1 &&
            runTime < top10[duplicatePlayerIndex].times.primary_t
          ) {
            top10[duplicatePlayerIndex] = run;
            top10.sort((a, b) => a.times.primary_t - b.times.primary_t);
            return;
          }

          let tempRun = run;
          for (let i = 0; i < 10; i++) {
            if (runTime < top10[i].times.primary_t) {
              const swapRun = top10[i];
              top10[i] = tempRun;
              tempRun = swapRun;
            }
          }
        }
        top10History.push(run);
      });

      const endTime = performance.now(); // End timing
      const duration = endTime - startTime; // Calculate duration

      console.log("Top 10:", top10);
      console.log("Top 10 History:", top10History);
      console.log(`forEach loop execution time: ${duration} milliseconds`);

      setTopTenHistory(top10History);
      setRuns(allRuns);
    } catch (error) {
      console.log(error);
      toast("Operation failed", { description: "Failed to fetch runs data." });
    } finally {
      setIsLoadingRuns(false);
    }
  };

  useEffect(() => {
    if (!game || !selectedCategory) return;
    fetchLeaderboard();
    setRuns([]);
    setTopTenHistory([]);
  }, [game, selectedCategory, selectedVariables]);

  const handleDebug = () => {
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
          <TabsTrigger value="history">Top 10 History</TabsTrigger>
        </TabsList>
        <TabsContent value="chart">
          <ChartDisplay leaderboard={leaderboard} />
        </TabsContent>
        <TabsContent value="history">
          <TopTenHistory
            runs={topTenHistory}
            isLoading={isLoadingRuns}
            onFetchRuns={fetchAllRuns}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpeedrunInfo;
