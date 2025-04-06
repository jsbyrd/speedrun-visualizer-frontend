import { Leaderboard, RunData, VariableValues } from "./types";
import { format, parseISO } from "date-fns";

/**
 * Fetches all runs data for a given game, category, and variables.
 * Breaks when a category has over 20,000 runs (thank you speedrun.com API).
 *
 * @param gameId The ID of the game.
 * @param selectedCategory The ID of the selected category.
 * @param selectedVariables The selected variables and their values.
 * @returns A promise that resolves to an array of RunData.
 */
export async function fetchAllRunsData(
  gameId: string,
  selectedCategory: string,
  selectedVariables: VariableValues
): Promise<RunData[]> {
  let url = `https://www.speedrun.com/api/v1/runs?game=${gameId}&category=${selectedCategory}&embed=players&status=verified&orderby=date&max=200`;
  Object.entries(selectedVariables).forEach(([varId, value]) => {
    url += `&var-${varId}=${value.id}`;
  });

  let allRuns: RunData[] = [];
  let nextUrl: string | null = url;
  let tenthousandthRunDate: Date | null = null;
  let isDescending = false; // Flag to indicate if we're fetching in descending order

  while (nextUrl) {
    let runsResponse: any;
    let retry = true;

    // Retry mechanism for rate limiting (status code 420)
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
    const newRuns = runsData.data as RunData[];
    allRuns = allRuns.concat(newRuns);

    // Check if we've reached 10,000 runs and switch to descending order
    if (allRuns.length >= 10000 && !isDescending) {
      console.log("SWITCHING TO DESCENDING ORDER");
      isDescending = true;
      tenthousandthRunDate = parseISO(allRuns[9999].date); // Store the 10,000th run's date
      url = `https://www.speedrun.com/api/v1/runs?game=${gameId}&category=${selectedCategory}&embed=players&status=verified&orderby=date&direction=desc&max=200`; // Change to descending order
      Object.entries(selectedVariables).forEach(([varId, value]) => {
        url += `&var-${varId}=${value.id}`;
      });
      nextUrl = url;
      continue; // Skip pagination logic and start fetching in descending order
    }

    // Check for overlap when fetching in descending order
    if (
      isDescending &&
      newRuns.length > 0 &&
      newRuns[newRuns.length - 1].date
    ) {
      const lastRunDate = parseISO(newRuns[newRuns.length - 1].date);
      if (lastRunDate < tenthousandthRunDate!) {
        break; // Stop fetching if we've reached the overlap
      }
    }

    if (runsData.pagination && runsData.pagination.links) {
      const nextLink = runsData.pagination.links.find(
        (link: any) => link.rel === "next"
      );
      nextUrl = nextLink ? nextLink.uri : null;
    } else {
      nextUrl = null;
    }
  }

  // Remove duplicate runs if we switched to descending order
  if (isDescending) {
    const uniqueRuns = new Map<string, RunData>();
    allRuns.forEach((run) => {
      uniqueRuns.set(run.id, run); // Use run.id as the key to ensure uniqueness
    });
    allRuns = Array.from(uniqueRuns.values());
  }

  // Filter out runs without a date
  const runsWithDate = allRuns.filter((run) => run.date);

  // Sort runs by date
  const sortedRuns = runsWithDate.sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );

  return sortedRuns;
}

/**
 * Fetches leaderboard data for a given game, category, and variables.
 *
 * @param gameId The ID of the game.
 * @param selectedCategory The ID of the selected category.
 * @param selectedVariables The selected variables and their values.
 * @returns A promise that resolves to the leaderboard data.
 */
export async function fetchLeaderboardData(
  gameId: string,
  selectedCategory: string,
  selectedVariables: VariableValues
): Promise<Leaderboard> {
  let url = `https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${selectedCategory}?top=100&embed=players`;
  Object.entries(selectedVariables).forEach(([varId, value]) => {
    url += `&var-${varId}=${value.id}`;
  });

  const leaderboardResponse = await fetch(url);
  if (!leaderboardResponse.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  const leaderboardData = await leaderboardResponse.json();
  return leaderboardData.data;
}

/**
 * Processes runs data to generate animation frames for the top 10 history.
 *
 * @param runs An array of RunData.
 * @returns An array of animation frames, each containing a date and the top 10 runs for that date.
 */
export function processRunsForAnimation(runs: RunData[]) {
  const animationFrames: { date: string; top10: RunData[] }[] = [];
  const currentTop10: RunData[] = [];
  let previousTop10: RunData[] = [];

  runs.forEach((run) => {
    const runDate = format(parseISO(run.date), "yyyy-MM-dd");
    const player = run.players.data[0];

    if (player) {
      if (player.rel === "guest" && player.name) {
        const duplicateGuestIndex = currentTop10.findIndex((topRun) => {
          const topPlayer = topRun.players.data[0];
          return topPlayer.rel === "guest" && topPlayer.name === player.name;
        });

        if (duplicateGuestIndex !== -1) {
          if (
            run.times.primary_t <
            currentTop10[duplicateGuestIndex].times.primary_t
          ) {
            currentTop10[duplicateGuestIndex] = run;
            currentTop10.sort((a, b) => a.times.primary_t - b.times.primary_t);
          }
        } else if (currentTop10.length < 10) {
          currentTop10.push(run);
          currentTop10.sort((a, b) => a.times.primary_t - b.times.primary_t);
        } else {
          for (let i = 0; i < 10; i++) {
            if (run.times.primary_t < currentTop10[i].times.primary_t) {
              currentTop10.splice(i, 0, run);
              currentTop10.pop();
              break;
            }
          }
        }
      } else if (player.rel === "user" && player.id) {
        const duplicateUserIndex = currentTop10.findIndex(
          (topRun) => topRun.players.data[0].id === player.id
        );

        if (duplicateUserIndex !== -1) {
          if (
            run.times.primary_t <
            currentTop10[duplicateUserIndex].times.primary_t
          ) {
            currentTop10[duplicateUserIndex] = run;
            currentTop10.sort((a, b) => a.times.primary_t - b.times.primary_t);
          }
        } else if (currentTop10.length < 10) {
          currentTop10.push(run);
          currentTop10.sort((a, b) => a.times.primary_t - b.times.primary_t);
        } else {
          for (let i = 0; i < 10; i++) {
            if (run.times.primary_t < currentTop10[i].times.primary_t) {
              currentTop10.splice(i, 0, run);
              currentTop10.pop();
              break;
            }
          }
        }
      }
    }

    // Check if the current top 10 is different from the previous top 10
    if (JSON.stringify(currentTop10) !== JSON.stringify(previousTop10)) {
      animationFrames.push({ date: runDate, top10: [...currentTop10] });
      previousTop10 = [...currentTop10]; // Update previous top 10
    }
  });

  return animationFrames;
}

/**
 * Retrieves the top 10 runs for a specific date.
 *
 * @param runs An array of RunData.
 * @param date The target date in ISO format.
 * @returns An array of the top 10 runs for the specified date.
 */
export function getTop10ForDate(runs: RunData[], date: string) {
  const targetDate = parseISO(date);
  const filteredRuns = runs.filter((run) => parseISO(run.date) <= targetDate);
  const sortedRuns = filteredRuns.sort((a, b) => {
    if (parseISO(b.date).getTime() !== parseISO(a.date).getTime()) {
      return parseISO(b.date).getTime() - parseISO(a.date).getTime();
    }
    return a.times.primary_t - b.times.primary_t;
  });

  const uniqueUsers = new Map<string, RunData>();
  sortedRuns.forEach((run) => {
    if (run.players && run.players.data && run.players.data.length > 0) {
      const player = run.players.data[0];
      const playerIdentifier = player.rel === "guest" ? player.name : player.id;
      if (!uniqueUsers.has(playerIdentifier)) {
        uniqueUsers.set(playerIdentifier, run);
      }
    }
  });

  const top10 = Array.from(uniqueUsers.values()).slice(0, 10);
  return top10;
}
